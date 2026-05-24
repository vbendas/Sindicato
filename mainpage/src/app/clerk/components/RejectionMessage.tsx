import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";

interface RejectionMessageProps {
  content: string;
}

export default function RejectionMessage({ content }: RejectionMessageProps) {
  return (
    <Message>
      <MessageAvatar src="/board-clerk.png" alt="Clerk AI" fallback="🤖" />
      <MessageContent className="bg-red-500/20 border border-red-500/30">
        {content}
      </MessageContent>
    </Message>
  );
}