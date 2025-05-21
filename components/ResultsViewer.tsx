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
import { memo, useEffect, useState } from "react";
import { LockIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import { saveAs } from 'file-saver'; // also install this


interface DataItem {
    [key: string]: any;
}

interface ResultsViewerProps {
    responseData: any;
}

export const ResultsViewer = memo(({ responseData }: ResultsViewerProps) => {

    const localData = responseData
    console.log('localData', localData);

    // if (!localData) {

    //     return (
    //         <Card className="w-full max-w-6xl">
    //             <CardHeader>
    //                 <CardTitle className="text-center">No Data Available</CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //                 <div className="text-center p-4">
    //                     <p>No response data received from the server.</p>
    //                 </div>
    //             </CardContent>
    //         </Card>
    //     );
    // }
    // console.log(localData, "s11");

    // if (localData?.error || !localData?.isSuccess) {
    //     return (
    //         <Card>
    //             {/* <CardHeader> */}
    //             {/* <CardTitle className="text-center text-red-500">Failed to Process the File</CardTitle> */}
    //             {/* </CardHeader> */}
    //             <CardContent>
    //                 <div className="text-center p-4">

    //                     <p className="flex justify-center gap-6"><X className="h-5 w-5 text-red-500" />{localData?.error || 'Failed to Process the File'}</p>
    //                 </div>
    //             </CardContent>
    //         </Card>
    //     );
    // }


    // if (!localData?.data || Object.keys(localData?.data).length === 0) {
    //     return (
    //         <Card className="w-full max-w-6xl">
    //             <CardHeader>
    //                 <CardTitle className="text-center">No Data Available</CardTitle>
    //             </CardHeader>
    //         </Card>
    //     );
    // }

    const combinedData = localData?.data?.combined || [];
    const Total_success_count = localData?.data?.Total_Success_count || [];
    const Total_failed_count = localData?.data?.Total_Failed_count || [];

    const otherSections = { ...localData.data };

    const dataSections = [
        // { key: "mismatched", label: "Mismatched Data" },
        { key: "not_in_Portal", label: "Not in Portal" },
        { key: "not_in_Portal_vendor_success", label: "Not in Portal(Vendor Succ)" },
        { key: "VENDOR_SUCCESS_IHUB_INPROGRESS", label: "Ven_Suc - IHub_Progress" },
        { key: "VENDOR_SUCCESS_IHUB_FAILED", label: "Ven_Suc - IHub_Failed" },
        { key: "Vendor_failed_ihub_initiated", label: "Ven_Failed - IHub_Initiated" },
        { key: "Tenant_db_ini_not_in_hubdb", label: "Tenant_DB_Init - Not_in_HubDB" },
        { key: "vend_ihub_succes_not_in_ledger", label: "Vend_IHub-Suc - Not in Ledger" },
        { key: "not_in_vendor", label: "Not in Vendor xl" },
    ];

    const activeSections = dataSections.filter(section => {
        const sectionData = otherSections[section.key];
        // console.log('sectionData', sectionData)
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
    console.log(combinedData, "s1");

    const [paginationState, setPaginationState] = useState<{ [key: string]: number }>({});
    const [currentPage, setCurrentPage] = useState(1); // For combinedData pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(combinedData.length / itemsPerPage);

    const paginatedData = combinedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const exportAllTabsToExcel = () => {
        const workbook = XLSX.utils.book_new();

        activeSections.forEach((section) => {
            const data = otherSections[section.key] || [];
            if (data.length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(workbook, worksheet, section.label || section.key);
            }
        });

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'detailed_results.xlsx');
    };


    return (
        <div className="space-y-6 w-full max-w-6xl">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Grand Total: {Total_success_count + Total_failed_count + combinedData.length}</CardTitle><br />
                    <CardTitle>Total Success : {Total_success_count}</CardTitle><br />
                    <CardTitle>Total Failed : {Total_failed_count}</CardTitle><br />
                    <CardTitle>Combined Data count: {combinedData.length}</CardTitle>
                    {combinedData.length > 0 && (
                        <Button
                            onClick={() => exportToExcel(combinedData, 'combined_data')}
                            variant="outline"
                        >
                            Export Combined Data to Excel
                        </Button>
                    )}
                </CardHeader>
                {/* <CardContent>
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
                                                <TableHead key={column}>{column.replace(/_/g, ' ')}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedData.map((item: DataItem, index: number) => (
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

                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </p>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent> */}
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-center">Detailed Results</CardTitle>
                    {activeSections.length > 0 && (
                        <Button onClick={exportAllTabsToExcel} variant="outline">
                            Export All Tabs
                        </Button>
                    )}
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
                                const currentPage = paginationState[section.key] || 1;
                                const totalPages = Math.ceil(data.length / itemsPerPage);
                                const paginatedData = data.slice(
                                    (currentPage - 1) * itemsPerPage,
                                    currentPage * itemsPerPage
                                );

                                const changePage = (newPage: number) => {
                                    setPaginationState((prev) => ({
                                        ...prev,
                                        [section.key]: newPage,
                                    }));
                                };
                                return (
                                    <TabsContent key={section.key} value={section.key} className="pt-4">
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between">
                                                <CardTitle>{section.label}</CardTitle>
                                                <span>Total count: {data.length}</span>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                {columns.map((column) => (
                                                                    <TableHead key={column}>{column.replace(/_/g, ' ')}</TableHead>
                                                                ))}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {paginatedData.map((item: DataItem, index: number) => (
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

                                                    {totalPages > 1 && (
                                                        <div className="flex justify-between items-center mt-4">
                                                            <p className="text-sm text-gray-600">
                                                                Page {currentPage} of {totalPages}
                                                            </p>
                                                            <div className="space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => changePage(Math.max(currentPage - 1, 1))}
                                                                    disabled={currentPage === 1}
                                                                >
                                                                    Previous
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
                                                                    disabled={currentPage === totalPages}
                                                                >
                                                                    Next
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
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

        </div>

    );
});
