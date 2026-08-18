import {Box} from "@mui/material";
import {type FC, useEffect, useRef} from "react";
import ChatsList from "../../components/chats/ChatsList.tsx";
import ChatHeader from "../../components/chats/ChatHeader.tsx";
import MessagesComponent from "../../components/chats/messages/MessagesComponent.tsx";
import MessageInput from "../../components/chats/messages/MessageInput.tsx";
import DataStateComponent from "../../components/shared/DataStateComponent.tsx";
import {PaginationComponent} from "../../components/shared/PaginationComponent.tsx";
import {routes} from "../../../routes/routes.ts";
import {useLocation, useNavigate, useParams} from "react-router";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getAll, getById} from "../../../services/fetch/chat.service.ts";
import PreloaderComponent from "../../components/shared/PreloaderComponent.tsx";
import SortSearchComponent from "../../components/shared/SortSearchComponent.tsx";
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import {getById as getUserById} from "../../../services/fetch/user.service.ts";
import {chatWsService} from "../../../services/websocket/chat.service.ts";
import type {MessageView} from "../../../models/chats/MessageView.ts";
import {ChatSortField} from "../../../models/enums/ChatSortField.ts";
import {usePaginatedQuery} from "../../../hooks/usePaginatedQuery.ts";
import type {PaginationRes} from "../../../models/pagiantion/PaginationRes.ts";
import type {ChatView} from "../../../models/chats/ChatView.ts";

const ChatsPage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const {userPublicId} = useParams();
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatWsService.connect();
        return () => {
            chatWsService.disconnect();
        };
    }, []);

    const {
        query,
        setQuery,
        data: chats,
        isLoading: chatsLoading,
        error: chatsError,
        handlePageChange,
    } = usePaginatedQuery<PaginationRes<ChatView>>(
        'chats',
        (query) =>
            getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as ChatSortField | undefined,
                sortDirection:
                    query.sortDirection as 'asc' | 'desc' | undefined,
                search: query.search ?? undefined,
            }),
        undefined,
        7
    );

    const {
        data: selectedUser,
        isLoading: selectedUserLoading,
        error: selectedUserError,
    } = useQuery({
        queryKey: ['chat-user', userPublicId],
        queryFn: () => getUserById(userPublicId!),
        enabled: !!userPublicId,
    });

    const {
        data: messages,
        isLoading: messagesLoading,
        error: messagesError,
    } = useQuery({
        queryKey: ['messages', userPublicId],
        queryFn: () => getById(userPublicId!),
        enabled: !!userPublicId,
    });

    useEffect(() => {
        const handleNewMessage = (message: MessageView) => {
            queryClient.setQueryData<MessageView[]>(
                ['messages', userPublicId],
                (oldMessages = []) => [
                    ...oldMessages,
                    message,
                ],
            );
        };
        chatWsService.onNewMessage(handleNewMessage);
        return () => {
            chatWsService.offNewMessage(handleNewMessage);
        };
    }, [userPublicId, queryClient]);

    useEffect(() => {
        if (!messagesContainerRef.current || !messages) return;

        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
    }, [userPublicId, messages]);

    const handleChatLoad = (publicId: string) => {
        navigate({
            pathname: routes.chats.buildById(publicId),
            search: location.search,
        });
    };

    const sendMessage = (body: string) => {
        if (!userPublicId) return;
        chatWsService.newMessage({recipientPublicId: userPublicId, body});
    };

    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                height: 'calc(100vh - 120px)',
                gap: 2,
                p: 2,
                boxSizing: 'border-box',
                minHeight: 0,
            }}
        >
            {(chatsLoading || selectedUserLoading || (!!userPublicId && messagesLoading)) && <PreloaderComponent/>}

            <Box
                sx={{
                    width: '25%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                }}
            >
                <Box
                    sx={{
                        '& > div': {
                            width: 'auto !important',
                            backgroundColor: 'transparent',
                            m: 1,
                        },
                    }}
                >
                    <SortSearchComponent
                        query={query as QueryParams<ChatSortField>}
                        setQuery={setQuery}
                        fields={Object.values(ChatSortField)}
                    />
                </Box>

                <DataStateComponent
                    data={chats}
                    error={chatsError}
                    loading={chatsLoading}
                    isEmpty={chats?.data.length === 0}
                >
                    {chats && (
                        <>
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                }}
                            >
                                <ChatsList
                                    handleChatLoad={handleChatLoad}
                                    chats={chats.data}
                                />
                            </Box>

                            <Box
                                sx={{
                                    '& > div': {
                                        width: 'auto !important',
                                        backgroundColor: 'transparent',
                                        m: 1,
                                    },
                                }}
                            >
                                <PaginationComponent
                                    page={query.page}
                                    pageCount={chats.pageCount}
                                    onChange={handlePageChange}
                                />
                            </Box>
                        </>
                    )}
                </DataStateComponent>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    boxShadow: 1,
                    overflow: 'hidden',
                    opacity: userPublicId ? 1 : 0.7,
                }}
            >
                {!userPublicId ? (
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                            fontSize: '1.2rem',
                            fontWeight: 500,
                        }}
                    >
                        select a chat to start
                    </Box>
                ) : (
                    <>
                        <DataStateComponent
                            data={selectedUser}
                            error={selectedUserError}
                            loading={selectedUserLoading}
                            isEmpty={!selectedUser}
                        >
                            {selectedUser && (
                                <ChatHeader user={selectedUser}/>
                            )}
                        </DataStateComponent>

                        <DataStateComponent
                            data={messages}
                            error={messagesError}
                            loading={messagesLoading}
                            isEmpty={false}
                        >
                            <Box
                                ref={messagesContainerRef}
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    overflowY: 'auto',
                                }}
                            >
                                <MessagesComponent
                                    messages={messages ?? []}
                                />
                            </Box>
                        </DataStateComponent>

                        <MessageInput
                            onSend={sendMessage}
                        />
                    </>
                )}
            </Box>
        </Box>
    );
};

export default ChatsPage;