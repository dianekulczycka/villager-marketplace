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
import {useQuery} from "@tanstack/react-query";
import {getAll, getById} from "../../../services/fetch/chat.service.ts";
import PreloaderComponent from "../../components/shared/PreloaderComponent.tsx";
import SortSearchComponent from "../../components/shared/SortSearchComponent.tsx";
import type {QueryParams} from "../../../models/pagiantion/QueryParams.ts";
import {getById as getUserById} from "../../../services/fetch/user.service.ts";
import {ChatSortField} from "../../../models/enums/ChatSortField.ts";
import type {PaginationView} from "../../../models/pagiantion/PaginationView.ts";
import type {ChatView} from "../../../models/chats/ChatView.ts";
import {usePaginatedQuery} from "../../../hooks/shared/usePaginatedQuery.ts";
import {useWsChat} from "../../../hooks/shared/useWsChat.ts";

const ChatsPage: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {userPublicId} = useParams();
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const {sendMessage} = useWsChat(userPublicId);

    const {
        query,
        setQuery,
        data: chats,
        isLoading: chatsLoading,
        error: chatsError,
        handlePageChange,
    } = usePaginatedQuery<PaginationView<ChatView>>(
        'chats',
        query =>
            getAll({
                page: query.page,
                perPage: query.perPage,
                sortBy: query.sortBy as ChatSortField | undefined,
                sortDirection:
                    query.sortDirection as
                        | 'asc'
                        | 'desc'
                        | undefined,
                search: query.search ?? undefined,
            }),
        undefined,
        7,
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
                    emptyMessage={"No chats yet. Start a conversation to see it here"}
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
                                    page={chats.page}
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
                        >
                            {selectedUser && (
                                <ChatHeader user={selectedUser}/>
                            )}
                        </DataStateComponent>

                        <DataStateComponent
                            data={messages}
                            error={messagesError}
                            loading={messagesLoading}
                            emptyMessage={"No messages yet"}
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

                        <MessageInput onSend={sendMessage}/>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default ChatsPage;