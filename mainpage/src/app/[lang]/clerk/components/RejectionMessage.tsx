import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";

interface RejectionMessageProps {
  content: string;
}

export default function RejectionMessage({ content }: RejectionMessageProps) {
  return (
    <Message>
      <MessageAvatar src="/clerk.png" alt="Clerk AI" fallback="🤖" className="border-2 border-black bg-sindicato-bordeaux" />
      <MessageContent className="bg-red-500/20 border border-red-500/30 rounded-3xl">
        {content}
      </MessageContent>
    </Message>
  );
}