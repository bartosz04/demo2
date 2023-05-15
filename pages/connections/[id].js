import { useRef } from 'react';
import BaseLayout from 'components/BaseLayout';
import { get } from 'services/conversations/get';
import apiRoutes from 'utils/apiRoutes';
import { user } from 'models';
import { getSession } from 'next-auth/client';
import useSWR, { mutate } from 'swr';
import Head from 'next/head';

export const getServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: {
        destination: `/login`,
        permanent: false
      }
    };
  }

  const currentUser = await user.findUnique({
    where: {
      email: session.user.email
    }
  });

  const conversation = await get({ id: Number(params.id), userId: currentUser.id });

  if (!conversation) {
    return {
      notFound: true
    };
  }

  return {
    props: { initConversation: conversation, currentUser }
  };
};

const MyMessage = ({ message }) => (
  <div className="flex justify-end mb-4">
    <div className="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white">
      {message.content}
    </div>
    <img src={message.user.image} className="object-cover h-8 w-8 rounded-full" alt="" />
  </div>
);

const Message = ({ message }) => (
  <div className="flex justify-start mb-4">
    <img src={message.user.image} className="object-cover h-8 w-8 rounded-full" alt="" />
    <div className="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white">
      {message.content}
    </div>
  </div>
);

const MessageForm = ({ conversationId }) => {
  const msgRef = useRef();

  const handleSubmit = async () => {
    await apiRoutes.conversations.message.create(conversationId, { content: msgRef.current.value });
    msgRef.current.value = '';
    mutate(`/api/conversations/${conversationId}`);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  return (
    <form className="py-5">
      <input
        onKeyDown={handleKey}
        ref={msgRef}
        className="w-full bg-gray-300 py-5 px-3 rounded-xl"
        type="text"
        placeholder="type your message here..."
      />
    </form>
  );
};

export default function Connections({ initConversation, currentUser }) {
  const {
    data: { conversation }
  } = useSWR(`/api/conversations/${initConversation.id}`, apiRoutes.fetcher, {
    initialData: { conversation: initConversation }
  });

  return (
    <BaseLayout>
      <Head>
        <title>Conversation</title>
      </Head>
      <div className="w-full px-5 flex flex-col justify-between bg-gree">
        <div className="flex flex-col mt-5">
          {conversation.messages.map((message) => {
            if (message.user.id === currentUser.id) {
              return <MyMessage key={message.id} message={message} />;
            }
            return <Message key={message.id} message={message} />;
          })}
        </div>
        <MessageForm conversationId={initConversation.id} />
      </div>
    </BaseLayout>
  );
}
