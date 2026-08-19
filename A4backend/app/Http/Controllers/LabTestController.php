<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use Illuminate\Http\Request;

class LabTestController extends Controller
{
    public function index()
    {
        return response()->json(LabTest::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:150|unique:lab_tests,name',
            'category' => 'nullable|string|max:100',
            'price'    => 'required|numeric|min:0',
        ]);

        $test = LabTest::create($request->only(['name', 'category', 'price']));

        return response()->json($test, 201);
    }

    public function update(Request $request, $id)
    {
        $test = LabTest::findOrFail($id);

        $request->validate([
            'name'     => 'required|string|max:150|unique:lab_tests,name,' . $test->id,
            'category' => 'nullable|string|max:100',
            'price'    => 'required|numeric|min:0',
        ]);

        $test->update($request->only(['name', 'category', 'price']));

        return response()->json($test);
    }

    public function destroy($id)
    {
        LabTest::findOrFail($id)->delete();

        return response()->json(['message' => 'Test removed from catalog.']);
    }
}
