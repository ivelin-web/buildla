import ChatWidget from '@/components/chat/ChatWidget';

export default function WidgetPage() {
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <ChatWidget isEmbed={true} />
    </div>
  );
}