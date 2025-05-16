import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import { useState } from "react";
import { LockIcon, X } from "lucide-react";

interface DataItem {
    [key: string]: any;
}

interface ResultsViewerProps {
    responseData: any;
}

export const ResultsViewer = ({ responseData }: ResultsViewerProps) => {
    const [isError, setIsError] = useState(false)

    const localData = responseData
    console.log('localData', localData);

    if (!localData) {

        return (
            <Card className="w-full max-w-6xl">
                <CardHeader>
                    <CardTitle className="text-center">No Data Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-4">
                        <p>No response data received from the server.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (localData?.error || !localData?.isSuccess) {
        return (
            <Card className="w-full max-w-6xl">
                <CardHeader>
                    {/* <CardTitle className="text-center text-red-500">Failed to Process the File</CardTitle> */}
                </CardHeader>
                <CardContent>
                    <div className="text-center p-4">

                        <p><span><X className="h-5 w-5 text-red-500" /></span>{localData?.error || 'Failed to Process the File'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }


    if (!localData?.data || Object.keys(localData?.data).length === 0) {
        return (
            <Card className="w-full max-w-6xl">
                <CardHeader>
                    <CardTitle className="text-center">No Data Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-4">
                        <p>The query returned no results for the selected criteria.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const combinedData = localData.data.combined || [];
    const otherSections = { ...localData.data, combined: undefined };

    const dataSections = [
        { key: "mismatched", label: "Mismatched Data" },
        { key: "not_in_Portal", label: "Not in Portal" },
        { key: "not_in_Portal_vendor_success", label: "Not in Portal (Vendor Success)" },
        { key: "VENDOR_SUCCESS_IHUB_INPROGRESS", label: "Vendor Success - IHub In Progress" },
        { key: "VENDOR_SUCCESS_IHUB_FAILED", label: "Vendor Success - IHub Failed" },
        { key: "Vendor_failed_ihub_initiated", label: "Vendor Failed - IHub Initiated" },
        { key: "Tenant_db_ini_not_in_hubdb", label: "Tenant DB Init Not in HubDB" },
        { key: "vend_ihub_succes_not_in_ledger", label: "Vendor IHub Success Not in Ledger" },
    ];

    const activeSections = dataSections.filter(section => {
        const sectionData = otherSections[section.key];
        console.log('sectionData', sectionData)
        return Array.isArray(sectionData) && sectionData.length > 0;
    });

    const exportToExcel = (data: DataItem[], fileName: string) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const formatValue = (value: any) => {
        if (typeof value === 'number' && isNaN(value)) return "N/A";
        if (value === null || value === undefined) return "N/A";
        return String(value);
    };

    return (
        <div className="space-y-6 w-full max-w-6xl">
            {!isError &&
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Combined Data</CardTitle>
                        {combinedData.length > 0 && (
                            <Button onClick={() => exportToExcel(combinedData, 'combined_data')} variant="outline">
                                Export to Excel
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {combinedData.length === 0 ? (
                            <div className="text-center p-4">
                                <p>No combined data available</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.keys(combinedData[0]).map((column) => (
                                                <TableHead key={column}>{column.replace(/_/g, " ")}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {combinedData.map((item: DataItem, index: number) => (
                                            <TableRow key={index}>
                                                {Object.keys(combinedData[0]).map((column) => (
                                                    <TableCell key={`${index}-${column}`}>
                                                        {formatValue(item[column])}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>}
            {!isError &&
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Detailed Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeSections.length === 0 ? (
                            <div className="text-center p-4">
                                <p>No detailed data available in any category.</p>
                            </div>
                        ) : (
                            <Tabs defaultValue={activeSections[0]?.key || ''} className="w-full">
                                <div className="overflow-x-auto pb-2">
                                    <TabsList className="flex w-full justify-start">
                                        {activeSections.map((section) => (
                                            <TabsTrigger key={section.key} value={section.key}>
                                                {section.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                {activeSections.map((section) => {
                                    const data = otherSections[section.key] || [];
                                    const columns = data.length > 0 ? Object.keys(data[0]) : [];

                                    return (
                                        <TabsContent key={section.key} value={section.key} className="pt-4">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <CardTitle>{section.label}</CardTitle>
                                                    <Button onClick={() => exportToExcel(data, section.key)} variant="outline">
                                                        Export to Excel
                                                    </Button>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    {columns.map((column) => (
                                                                        <TableHead key={column}>{column.replace(/_/g, " ")}</TableHead>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {data.map((item: DataItem, index: number) => (
                                                                    <TableRow key={index}>
                                                                        {columns.map((column) => (
                                                                            <TableCell key={`${index}-${column}`}>
                                                                                {formatValue(item[column])}
                                                                            </TableCell>
                                                                        ))}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            }
            {isError &&
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Detailed Results</CardTitle>
                    </CardHeader>
                </Card>}
        </div>
    );
};
