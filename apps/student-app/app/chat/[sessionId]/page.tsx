/**
 * Chat Page: /chat/[sessionId]
 *
 * Interactive assessment chat interface where students converse with Jenny
 * Features:
 * - Real-time streaming responses
 * - Progress tracking through assessment stages
 * - EQ-modulated tone adaptation
 * - Evidence citations and knowledge retrieval
 */

import AssessmentChatWrapper from '../../../components/chat/AssessmentChatWrapper';

export default function ChatPage({ params }: { params: { sessionId: string } }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    }}>
      <AssessmentChatWrapper sessionId={params.sessionId} showDebugPanel={true} />
    </div>
  );
}
