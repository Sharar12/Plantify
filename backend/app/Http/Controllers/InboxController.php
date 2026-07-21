<?php

namespace App\Http\Controllers;

use App\Models\InboxMessage;
use Illuminate\Http\Request;

class InboxController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        if (!$userId) {
            return response()->json(['message' => 'User ID is required'], 400);
        }

        $messages = InboxMessage::where('user_id', $userId)
            ->with(['order.items.plant'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }

    public function markAsRead($id)
    {
        $message = InboxMessage::findOrFail($id);
        $message->is_read = true;
        $message->save();

        return response()->json($message);
    }

    public function destroy($id)
    {
        $message = InboxMessage::findOrFail($id);
        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}
