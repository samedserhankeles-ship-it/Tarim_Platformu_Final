import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search } from "lucide-react";
import { getConversations, getMessages } from "@/app/actions/message";
import ChatView from "./chat-view";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MessagesPage(props: {
  searchParams?: Promise<{ conv?: string }>;
}) {
  const searchParams = await props.searchParams || {};
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect("/auth/sign-in");
  }

  const conversations = await getConversations();
  const selectedConversationId = searchParams.conv;

  let selectedConversation = null;
  let initialMessages: any[] = [];
  let initialIsBlocked = false;

  if (selectedConversationId) {
    selectedConversation = conversations.find(c => c.id === selectedConversationId);
    if (selectedConversation) {
        initialMessages = await getMessages(selectedConversationId);
        
        // currentUser is guaranteed to exist due to redirect check above
        const block = await prisma.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: currentUser.id,
                    blockedId: selectedConversation.partner.id
                }
            }
        });
        initialIsBlocked = !!block;
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-120px)] rounded-xl border bg-card overflow-hidden">
      {/* Conversation List (Left Panel) */}
      <div className={`flex flex-col w-full md:w-80 border-r bg-background shrink-0 ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Mesajlar</h2>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Kişi Ara..." className="pl-10 h-10" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
                Henüz hiç mesajınız yok.
            </div>
          ) : (
            conversations.map((conv) => (
                <Link key={conv.id} href={`/dashboard/mesajlar?conv=${conv.id}`}>
                <div
                    className={`flex items-center gap-3 p-4 border-b hover:bg-muted/50 transition-colors ${
                    conv.id === selectedConversationId ? "bg-muted/70" : ""
                    }`}
                >
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.partner.image || undefined} />
                        <AvatarFallback>{conv.partner.name ? conv.partner.name.substring(0,2).toUpperCase() : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold truncate">{conv.partner.name}</h3>
                        {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {new Date(conv.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage ? conv.lastMessage.content : "Yeni Sohbet"}
                    </p>
                    </div>
                </div>
                </Link>
            ))
          )}
        </div>
      </div>

      {/* Chat Window (Right Panel) */}
      <div className={`flex-col flex-1 ${selectedConversationId ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <ChatView 
            conversationId={selectedConversation.id} 
            partner={selectedConversation.partner} 
            initialMessages={initialMessages}
            initialIsBlocked={initialIsBlocked}
            isLoggedIn={true} // User is guaranteed to be logged in due to redirect check
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-center p-8">
            <div>
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Bir sohbet seçin</p>
                <p className="text-sm">veya ilanlardan "Mesaj Gönder" ile yeni bir sohbet başlatın.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}