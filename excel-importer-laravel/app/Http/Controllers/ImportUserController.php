<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Imports\UsersImport;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Storage;
class ImportUserController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,xls'
        ]);

        $import = new UsersImport();
        Excel::import($import, $request->file('file'));

        foreach ($import->validRows as $data) {
            User::create($data);
        }

        $downloadUrl = null;
        if (count($import->errors)) {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            $sheet->fromArray(['Row', 'Column', 'Message'], null, 'A1');

            foreach ($import->errors as $i => $error) {
                $sheet->fromArray([
                    $error['row'],
                    $error['column'],
                    $error['message'],
                ], null, 'A' . ($i + 2));
            }

            $filename = 'failed_rows_' . time() . '.xlsx';
            $path = 'failed/' . $filename;

            $writer = new Xlsx($spreadsheet);
            Storage::disk('public')->makeDirectory('failed');
            $writer->save(storage_path('app/public/' . $path));

            $downloadUrl = asset('storage/' . $path);
        }

        return response()->json([
            'success' => count($import->errors) === 0,
            'summary' => [
                'total' => count($import->errors) + count($import->validRows),
                'valid' => count($import->validRows),
                'invalid' => count($import->errors),
            ],
            'errors' => $import->errors,
            'downloadUrl' => $downloadUrl
        ]);
    }
}
