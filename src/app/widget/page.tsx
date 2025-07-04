import ChatWidget from '@/components/chat/ChatWidget';

export default function WidgetPage() {
  return (
    <div className="min-h-screen">
      <ChatWidget isEmbed={true} />
    </div>
  );
}