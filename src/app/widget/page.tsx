import ChatWidget from '@/components/chat/ChatWidget';

export default function WidgetPage() {
  return (
    <div className="h-full">
      <ChatWidget isEmbed={true} />
    </div>
  );
}