<?php

namespace App\Imports;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToCollection, WithHeadingRow
{
    public $validRows = [];
    public $errors = [];

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowArray = $row->toArray();

            $validator = Validator::make($rowArray, [
                'name'  => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'nullable|string|max:20',
            ], [
                'name.required'  => 'Name is required',
                'email.required' => 'Email is required',
                'email.email'    => 'Email must be valid',
                'email.unique'   => 'Email already exists',
            ]);

            if ($validator->fails()) {
                foreach ($validator->errors()->messages() as $field => $messages) {
                    foreach ($messages as $message) {
                        $this->errors[] = [
                            'row'     => $index + 2, 
                            'column'  => $field,
                            'message' => $message,
                        ];
                    }
                }
            } else {
                $phone = isset($row['phone']) ? (string) $row['phone'] : null;
                $this->validRows[] = [
                    'name'     => $row['name'],
                    'email'    => $row['email'],
                    'phone'    => $phone,
                    'password' => bcrypt('defaultPassword123'),
                ];
            }
        }
    }
}
