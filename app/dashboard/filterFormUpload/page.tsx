"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResultsViewer } from "@/components/ResultsViewer";
import { WidthIcon } from "@radix-ui/react-icons";

// Schema for form validation
const formSchema = z.object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    serviceName: z.string().min(1, "Service is required").refine(val => val !== "default", {
        message: "Please select a service",
    }),
    transactionType: z.string().optional(),
    file: z.instanceof(File).refine(file => file.size > 0, {
        message: "File is required",
    }),
}).refine(data => {
    if (data.fromDate && data.toDate) {
        const from = new Date(data.fromDate);
        const to = new Date(data.toDate);
        return to >= from;
    }
    return true;
}, {
    message: "To Date must be after From Date",
    path: ["toDate"],
});

type FormValues = z.infer<typeof formSchema>;

const serviceOptions = [
    { value: "RECHARGE", label: "PaySprint-Recharge" },
    { value: "AEPS", label: "PaySprint-Aeps" },
    { value: "IMT", label: "PaySprint-IMT" },
    { value: "BBPS", label: "BBPS" },
    { value: "Pan_UTI", label: "Pan_UTI", disabled: true },
    { value: "Pan_NSDL", label: "Pan_NSDL", disabled: true },
];

const transactionOptions = [
    { value: "1", label: "Enquiry" },
    { value: "2", label: "Withdrawal" },
    { value: "3", label: "Mini Statement" },
];

const FilterForm = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState("No file chosen");
    const [apiResponse, setApiResponse] = useState<any>(null); // To store API response

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fromDate: "",
            toDate: "",
            serviceName: "",
            transactionType: "default",
            file: undefined,
        },
    });

    const selectedService = form.watch("serviceName");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("file", file);
            setFileName(file.name);
            form.clearErrors("file");
        }
    };

    const clearForm = () => {
        form.reset();
        setFileName("No file chosen");
        setApiResponse(null);
    };

    const normalizeResponse = (responseData: any) => {


        try {
            return typeof responseData === "string" ? JSON.parse(responseData) : responseData;
        } catch (error) {
            console.error(error)
            return null
        }
    }
    const processData = async (values: FormValues) => {
        setIsSubmitting(true);
        setApiResponse(null); // Reset previous response

        try {
            const formData = new FormData();
            formData.append("from_date", values.fromDate);
            formData.append("to_date", values.toDate);
            formData.append("service_name", values.serviceName);
            if (values.transactionType && values.transactionType !== "default") {
                formData.append("transaction_type", values.transactionType);
            }
            formData.append("file", values.file);

            const res = await axios.post("http://localhost:5000/api/dummydata", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const response = {
                ...res,
                data: normalizeResponse(res.data)
            }

            console.log(response, "S!!", typeof (response.data));

            if (response.status === 200) {
                toast.success("Data processed successfully!");
                setApiResponse(response.data);
            } else if (response.status === 202) {
                toast.warning(response.data.message);
            } else {
                throw new Error("Unexpected response from server");
            }
        } catch (error) {
            console.error("Error:", error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "Error processing file";
                toast.error(errorMessage);
                setApiResponse({ error: errorMessage });
            } else {
                const errorMessage = error instanceof Error ? error.message : "Something went wrong!";
                toast.error(errorMessage);
                setApiResponse({ error: errorMessage });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4">
            <Card className="w-full max-w-lg mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Select Inputs Deatils
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processData)} className="space-y-6">
                            <div className="flex gap-4 justify-between">
                                {/* From Date */}
                                <div className="w-full">
                                    <FormField
                                        control={form.control}
                                        name="fromDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>From Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="w-full">
                                    {/* To Date */}
                                    <FormField
                                        control={form.control}
                                        name="toDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>To Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                {/* Service Name */}
                                <FormField
                                    control={form.control}
                                    name="serviceName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Service</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="--Select service--" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {serviceOptions.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                            disabled={option.disabled}
                                                            className={option.disabled ? "text-red-500" : ""}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Transaction Type (only visible for Aeps) */}
                            {selectedService === "Aeps" && (
                                <FormField
                                    control={form.control}
                                    name="transactionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transaction Type</FormLabel>
                                            <Select onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="--Select transaction--" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {transactionOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* File Upload */}
                            <FormField
                                control={form.control}
                                name="file"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Upload Excel File</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <Button asChild variant="outline">
                                                <label className="cursor-pointer">
                                                    Choose File
                                                    <Input
                                                        type="file"
                                                        accept=".xlsx"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                            </Button>
                                            <span className="text-sm text-muted-foreground">
                                                {fileName}
                                            </span>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Process"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={clearForm}
                                    disabled={isSubmitting}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results Section */}
            {apiResponse && (
                <ResultsViewer responseData={apiResponse} />
            )}
        </div>
    );
};

export default FilterForm;