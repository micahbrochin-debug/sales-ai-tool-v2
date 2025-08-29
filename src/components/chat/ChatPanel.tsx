'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { ChatMessage } from '@/types';
import ReactMarkdown from 'react-markdown';

export function ChatPanel() {
  const { 
    chatMessages, 
    addChatMessage, 
    currentProject,
    isLoading,
    setLoading 
  } = useAppStore();
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message
    addChatMessage({
      role: 'user',
      content: userMessage,
      project_id: currentProject?.id
    });

    try {
      // Simulate AI processing
      const aiResponse = await processAIQuery(userMessage, currentProject);
      
      // Add AI response
      addChatMessage({
        role: 'assistant',
        content: aiResponse,
        project_id: currentProject?.id
      });
    } catch (error) {
      addChatMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        project_id: currentProject?.id
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-medium text-secondary-900">Sales Copilot</h3>
            <p className="text-sm text-secondary-600">
              Ask questions about {currentProject?.company_name || 'your project'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={48} className="mx-auto mb-4 text-secondary-400" />
            <h4 className="text-lg font-medium text-secondary-900 mb-2">
              Start a conversation
            </h4>
            <p className="text-secondary-600 mb-4">
              I can help you with questions about your research data and sales strategy.
            </p>
            <div className="text-sm text-secondary-500 space-y-2">
              <p><strong>Try asking:</strong></p>
              <div className="space-y-1">
                <p>"What are the main pain points for this company?"</p>
                <p>"Who should I contact first?"</p>
                <p>"What's our competitive advantage here?"</p>
                <p>"Summarize the key risks"</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            
            {isProcessing && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex items-center space-x-2 bg-secondary-100 rounded-lg px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-secondary-600" />
                  <span className="text-secondary-600">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-secondary-200">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your sales opportunity..."
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={`
              px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center
              ${!input.trim() || isProcessing
                ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
              }
            `}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatMessageComponent({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-start space-x-3">
      {message.role === 'assistant' ? (
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-white" />
        </div>
      ) : (
        <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-white" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className={`
          inline-block px-4 py-3 rounded-lg max-w-none
          ${message.role === 'assistant' 
            ? 'bg-secondary-100 text-secondary-900' 
            : 'bg-primary-600 text-white'
          }
        `}>
          {message.role === 'assistant' ? (
            <ReactMarkdown 
              className="prose prose-sm max-w-none dark:prose-invert prose-p:m-0 prose-p:leading-relaxed prose-pre:p-0 prose-li:my-0"
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        
        <p className="text-xs text-secondary-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}

// Mock AI query processing
async function processAIQuery(query: string, project: any): Promise<string> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('pain') || lowerQuery.includes('problem')) {
    return `Based on the research data, here are the key pain points I've identified:

• **Manual security testing delays**: The company is experiencing deployment bottlenecks due to manual security processes
• **Lack of CI/CD integration**: Security testing isn't automated in their development pipeline
• **Developer productivity impact**: Security reviews are slowing down feature releases
• **Compliance requirements**: They need to meet SOC 2 and ISO 27001 standards

The prospect John Smith, as a Senior Software Engineer, likely feels these pain points directly in his daily work.`;
  }

  if (lowerQuery.includes('contact') || lowerQuery.includes('who')) {
    return `Based on the account mapping, here's the recommended contact strategy:

**Primary Contacts:**
1. **Jane Doe (CTO)** - Economic Buyer
   - Final decision authority for security tools
   - Focus on business outcomes and ROI

2. **Bob Wilson (VP Engineering)** - Champion  
   - Strong advocate for developer productivity
   - Technical decision influence

**Contact Sequence:**
1. Start with Bob Wilson (warm introduction through John Smith)
2. Get Bob's buy-in and technical validation
3. Have Bob facilitate introduction to Jane Doe
4. Present business case to Jane with Bob's support

This approach leverages the existing relationship and follows the organizational hierarchy.`;
  }

  if (lowerQuery.includes('advantage') || lowerQuery.includes('competitive')) {
    return `Our key competitive advantages for this opportunity:

**vs. SonarQube (current tool):**
• More comprehensive web application security testing
• Better integration with modern CI/CD pipelines
• Superior vulnerability detection for web-specific issues

**vs. Veracode/Checkmarx:**
• More developer-friendly interface and workflow
• Faster scanning with fewer false positives
• Better support for modern web frameworks and APIs

**Unique differentiators:**
• Research-driven approach to vulnerability detection
• Extensive BApp Store for customization
• Strong community and security researcher backing
• Proven track record with similar-sized companies`;
  }

  if (lowerQuery.includes('risk')) {
    return `Key risks identified for this opportunity:

**High Priority:**
• **Competition from SonarQube** - They're already using it for code quality
• **Budget constraints** - Q1 budget cycles might be tight
• **Technical integration complexity** - Need to ensure smooth CI/CD integration

**Medium Priority:**
• **Decision timeline pressure** - Q2 implementation target is aggressive
• **Champion availability** - Bob Wilson might have competing priorities
• **Procurement process** - 30-60 day cycle could impact timeline

**Mitigation strategies:**
• Emphasize complementary value to existing SonarQube investment
• Provide detailed ROI calculations and pilot program options
• Offer dedicated technical resources for integration support`;
  }

  if (lowerQuery.includes('timeline') || lowerQuery.includes('next')) {
    return `Recommended next steps and timeline:

**Week 1-2:**
• Technical demonstration with Bob Wilson's team
• Validate CI/CD integration requirements
• Share relevant case studies and ROI data

**Week 3-4:**
• Pilot project proposal and scope definition
• Introduction to Jane Doe (CTO) via Bob Wilson
• Present business case and budget requirements

**Month 2:**
• Pilot implementation and results evaluation
• Commercial proposal and procurement initiation
• Contract negotiation and legal review

**Month 3:**
• Contract finalization and purchase approval
• Full deployment planning and kickoff

The Q2 target is achievable if we maintain momentum and avoid delays in the technical evaluation phase.`;
  }

  // Generic fallback response
  return `I'd be happy to help with that! Based on the available research data for ${project?.company_name || 'this company'}, I can provide insights on:

• Company intelligence and market position
• Technical stack and security tools analysis  
• Stakeholder mapping and engagement strategy
• Sales strategy and value proposition
• Risk assessment and mitigation plans

Could you be more specific about what aspect you'd like to explore? For example:
- "What are the main technical challenges?"
- "Who are the key decision makers?"
- "What's our competitive position?"
- "What risks should we be aware of?"`;
}