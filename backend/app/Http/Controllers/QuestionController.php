<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use App\Models\User;

class QuestionController extends Controller
{
    public function all()
    {
        $questions = Question::with(['customer:id,name', 'specialist:id,name', 'plant'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($questions);
    }

    public function index($plantId)
    {
        $questions = Question::where('plant_id', $plantId)
            ->with(['customer:id,name', 'specialist:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($questions);
    }

    public function store(Request $request, $plantId)
    {
        $validated = $request->validate([
            'question' => 'required|string',
        ]);

        $customerId = $request->input('customer_id');

        $customer = User::find($customerId);
        if (!$customer || $customer->role !== 'customer') {
            return response()->json(['message' => 'Only customers can ask questions'], 403);
        }

        $validated['plant_id'] = $plantId;
        $validated['customer_id'] = $customerId;

        $question = Question::create($validated);

        $specialist = User::where('role', 'specialist')->first();
        if ($specialist) {
            $question->specialist_id = $specialist->id;
            $question->save();
        }

        return response()->json($question, 201);
    }

    public function answer(Request $request, $questionId)
    {
        $validated = $request->validate([
            'answer' => 'required|string',
        ]);

        $userId = $request->input('user_id');
        $user = User::find($userId);
        
        if (!$user || $user->role !== 'specialist') {
            return response()->json(['message' => 'Only specialists can answer questions'], 403);
        }

        $question = Question::findOrFail((int) $questionId);
        $question->answer = $validated['answer'];
        $question->specialist_id = $userId;
        $question->save();

        return response()->json($question);
    }
}