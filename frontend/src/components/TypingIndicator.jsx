export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
  );
}
