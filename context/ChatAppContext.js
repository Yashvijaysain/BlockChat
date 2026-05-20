import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast from 'react-hot-toast';
import IDL from '../lib/idl.json';

const ChatAppContext = createContext();
const DEFAULT_PROGRAM_ID = '51TsZDgA6j8wp1zPSxTga6oLW6gj1kqxAbQQu6FxaWmn';

export const useChatApp = () => {
  const context = useContext(ChatAppContext);
  if (!context) {
    throw new Error('useChatApp must be used within ChatAppProvider');
  }
  return context;
};

export const ChatAppProvider = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Program ID from your deployed contract
  const programId = (process.env.NEXT_PUBLIC_PROGRAM_ID || DEFAULT_PROGRAM_ID).trim();
  const PROGRAM_ID = new PublicKey(programId);
  const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState(null);

  // Create program instance
  const program = useMemo(() => {
    if (!wallet.publicKey) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      {
        preflightCommitment: 'processed',
        commitment: 'processed',
        skipPreflight: true, // Skip simulation
      }
    );

    return new Program(IDL, PROGRAM_ID, provider);
  }, [connection, wallet.publicKey]);

  // Helper function to get PDA
  const getPDA = async (seeds, programId = PROGRAM_ID) => {
    const [pda, bump] = await PublicKey.findProgramAddress(seeds, programId);
    return { pda, bump };
  };

  // Get App State PDA
  const getAppStatePDA = async () => {
    return await getPDA([Buffer.from('app_state')]);
  };

  const verifyProgramAccount = async () => {
    const accountInfo = await connection.getAccountInfo(PROGRAM_ID);

    if (!accountInfo || !accountInfo.executable) {
      const message = `Program ${PROGRAM_ID.toString()} is not deployed on ${NETWORK}. Deploy it successfully in Solana Playground before initializing.`;
      console.error(message);
      toast.error(message, { duration: 8000 });
      return false;
    }

    return true;
  };

  // Get User Account PDA
  const getUserAccountPDA = async (userPublicKey) => {
    return await getPDA([
      Buffer.from('user'),
      userPublicKey.toBuffer()
    ]);
  };

  // Get Friendship PDA
  const getFriendshipPDA = async (user1, user2) => {
    const [smaller, larger] = user1.toBase58() < user2.toBase58()
      ? [user1, user2]
      : [user2, user1];

    return await getPDA([
      Buffer.from('friendship'),
      smaller.toBuffer(),
      larger.toBuffer()
    ]);
  };

  // Get Chat PDA
  const getChatPDA = async (user1, user2) => {
    const [smaller, larger] = user1.toBase58() < user2.toBase58()
      ? [user1, user2]
      : [user2, user1];

    return await getPDA([
      Buffer.from('chat'),
      smaller.toBuffer(),
      larger.toBuffer()
    ]);
  };

  // Get Message PDA
  const getMessagePDA = async (chat, messageIndex) => {
    return await getPDA([
      Buffer.from('message'),
      chat.toBuffer(),
      new BN(messageIndex).toArrayLike(Buffer, 'le', 8)
    ]);
  };

  // Initialize the program (Admin only)
  const initializeProgram = async () => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);

      const programExists = await verifyProgramAccount();
      if (!programExists) {
        return;
      }

      const { pda: appStatePDA } = await getAppStatePDA();

      const tx = await program.methods
        .initialize()
        .accounts({
          appState: appStatePDA,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Program initialized successfully!');
      console.log('Transaction signature:', tx);
      await fetchAppState();
      return tx;
    } catch (error) {
      console.error('Error initializing program:', error);
      toast.error(error.message || 'Failed to initialize program');
    } finally {
      setLoading(false);
    }
  };

  // Create user account
  const createAccount = async (name) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!name || name.trim().length === 0) {
      toast.error('Please enter a valid name');
      return;
    }

    try {
      setLoading(true);

      // Check if app state is initialized
      const { pda: appStatePDA } = await getAppStatePDA();
      const appStateAccount = await fetchAppState();

      if (!appStateAccount) {
        toast.error('Program not initialized. Please contact the admin to initialize the program first.');
        setLoading(false);
        return;
      }

      const { pda: userAccountPDA } = await getUserAccountPDA(wallet.publicKey);

      const tx = await program.methods
        .createAccount(name.trim())
        .accounts({
          userAccount: userAccountPDA,
          appState: appStatePDA,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Account created successfully!');
      console.log('Transaction signature:', tx);
      await fetchCurrentUser();
      return tx;
    } catch (error) {
      console.error('Error creating account:', error);

      // More specific error handling
      if (error.message?.includes('AccountNotInitialized') || error.message?.includes('3012')) {
        toast.error('Program not initialized. Please contact the admin to initialize the program first.');
      } else if (error.message?.includes('already in use')) {
        toast.error('Account already exists for this wallet');
        await fetchCurrentUser();
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update profile picture
  const updateProfilePicture = async (ipfsHash) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      const { pda: userAccountPDA } = await getUserAccountPDA(wallet.publicKey);

      const tx = await program.methods
        .updateProfilePicture(ipfsHash)
        .accounts({
          userAccount: userAccountPDA,
          user: wallet.publicKey,
        })
        .rpc();

      toast.success('Profile picture updated!');
      console.log('Transaction signature:', tx);
      await fetchCurrentUser();
      return tx;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error(error.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  // Add friend
  const addFriend = async (friendPublicKey, friendName) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      const friendPubKey = new PublicKey(friendPublicKey);
      const { pda: userAccountPDA } = await getUserAccountPDA(wallet.publicKey);
      const { pda: friendAccountPDA } = await getUserAccountPDA(friendPubKey);
      const { pda: friendshipPDA } = await getFriendshipPDA(wallet.publicKey, friendPubKey);

      const tx = await program.methods
        .addFriend(friendName)
        .accounts({
          userAccount: userAccountPDA,
          friendAccount: friendAccountPDA,
          friendship: friendshipPDA,
          user: wallet.publicKey,
          friend: friendPubKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Friend added successfully!');
      console.log('Transaction signature:', tx);
      await fetchFriends();
      return tx;
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error(error.message || 'Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  // Initialize chat
  const initializeChat = async (friendPublicKey) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const friendPubKey = new PublicKey(friendPublicKey);
      const { pda: chatPDA } = await getChatPDA(wallet.publicKey, friendPubKey);

      // Check if chat already exists
      try {
        await program.account.chat.fetch(chatPDA);
        // Chat already exists, no need to initialize
        return null;
      } catch (e) {
        // Chat doesn't exist, proceed with initialization
      }

      const tx = await program.methods
        .initializeChat()
        .accounts({
          chat: chatPDA,
          user1: wallet.publicKey,
          user2: friendPubKey,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Chat initialized:', tx);
      return tx;
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Chat might already exist, which is okay
      if (!error.message || !error.message.includes('already in use')) {
        throw error;
      }
    }
  };

  // Send text message
  const sendMessage = async (friendPublicKey, content) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!content || content.trim().length === 0) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setLoading(true);
      const friendPubKey = new PublicKey(friendPublicKey);

      // Initialize chat if needed
      try {
        await initializeChat(friendPubKey);
      } catch (initError) {
        console.error('Error initializing chat:', initError);
        // Continue even if initialization fails - it might already exist
      }

      const { pda: chatPDA } = await getChatPDA(wallet.publicKey, friendPubKey);

      // Verify chat exists
      let chatAccount;
      try {
        chatAccount = await program.account.chat.fetch(chatPDA);
      } catch (fetchError) {
        console.error('Chat account does not exist:', fetchError);
        toast.error('Please initialize chat first. Try again in a moment.');
        setLoading(false);
        return;
      }

      const messageIndex = chatAccount.messageCount;

      const { pda: messagePDA } = await getMessagePDA(chatPDA, messageIndex);
      const { pda: senderAccountPDA } = await getUserAccountPDA(wallet.publicKey);
      const { pda: receiverAccountPDA } = await getUserAccountPDA(friendPubKey);
      const { pda: friendshipPDA } = await getFriendshipPDA(wallet.publicKey, friendPubKey);

      const tx = await program.methods
        .sendMessage(content.trim())
        .accounts({
          message: messagePDA,
          chat: chatPDA,
          senderAccount: senderAccountPDA,
          receiverAccount: receiverAccountPDA,
          friendship: friendshipPDA,
          sender: wallet.publicKey,
          receiver: friendPubKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Message sent!');
      console.log('Message sent:', tx);
      await fetchMessages(friendPublicKey);
      return tx;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Send media message
  const sendMediaMessage = async (friendPublicKey, ipfsHash, msgType, metadata = '') => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      const friendPubKey = new PublicKey(friendPublicKey);

      // Initialize chat if needed
      try {
        await initializeChat(friendPubKey);
      } catch (initError) {
        console.error('Error initializing chat:', initError);
        // Continue even if initialization fails - it might already exist
      }

      const { pda: chatPDA } = await getChatPDA(wallet.publicKey, friendPubKey);

      // Verify chat exists
      let chatAccount;
      try {
        chatAccount = await program.account.chat.fetch(chatPDA);
      } catch (fetchError) {
        console.error('Chat account does not exist:', fetchError);
        toast.error('Please initialize chat first. Try again in a moment.');
        setLoading(false);
        return;
      }

      const messageIndex = chatAccount.messageCount;

      const { pda: messagePDA } = await getMessagePDA(chatPDA, messageIndex);
      const { pda: senderAccountPDA } = await getUserAccountPDA(wallet.publicKey);
      const { pda: receiverAccountPDA } = await getUserAccountPDA(friendPubKey);
      const { pda: friendshipPDA } = await getFriendshipPDA(wallet.publicKey, friendPubKey);

      // Convert message type to the enum format expected by the program
      const messageType = msgType === 'image' ? { image: {} }
                        : msgType === 'video' ? { video: {} }
                        : msgType === 'audio' ? { audio: {} }
                        : { text: {} };

      const tx = await program.methods
        .sendMediaMessage(ipfsHash, messageType, metadata)
        .accounts({
          message: messagePDA,
          chat: chatPDA,
          senderAccount: senderAccountPDA,
          receiverAccount: receiverAccountPDA,
          friendship: friendshipPDA,
          sender: wallet.publicKey,
          receiver: friendPubKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Media sent successfully!');
      console.log('Media message sent:', tx);
      await fetchMessages(friendPublicKey);
      return tx;
    } catch (error) {
      console.error('Error sending media message:', error);
      toast.error(error.message || 'Failed to send media');
    } finally {
      setLoading(false);
    }
  };

  // Send SOL with message
  const sendSolWithMessage = async (friendPublicKey, content, amount) => {
    if (!program || !wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const friendPubKey = new PublicKey(friendPublicKey);

      // Initialize chat if needed
      try {
        await initializeChat(friendPubKey);
      } catch (initError) {
        console.error('Error initializing chat:', initError);
        // Continue even if initialization fails - it might already exist
      }

      const { pda: chatPDA } = await getChatPDA(wallet.publicKey, friendPubKey);

      // Verify chat exists
      let chatAccount;
      try {
        chatAccount = await program.account.chat.fetch(chatPDA);
      } catch (fetchError) {
        console.error('Chat account does not exist:', fetchError);
        toast.error('Please initialize chat first. Try again in a moment.');
        setLoading(false);
        return;
      }

      const messageIndex = chatAccount.messageCount;

      const { pda: messagePDA } = await getMessagePDA(chatPDA, messageIndex);
      const { pda: senderAccountPDA } = await getUserAccountPDA(wallet.publicKey);
      const { pda: receiverAccountPDA } = await getUserAccountPDA(friendPubKey);
      const { pda: friendshipPDA } = await getFriendshipPDA(wallet.publicKey, friendPubKey);

      const lamports = new BN(amount * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .sendSolWithMessage(content.trim(), lamports)
        .accounts({
          message: messagePDA,
          chat: chatPDA,
          senderAccount: senderAccountPDA,
          receiverAccount: receiverAccountPDA,
          friendship: friendshipPDA,
          sender: wallet.publicKey,
          receiver: friendPubKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success(`Sent ${amount} SOL successfully!`);
      console.log('SOL transfer message sent:', tx);
      await fetchMessages(friendPublicKey);
      return tx;
    } catch (error) {
      console.error('Error sending SOL with message:', error);
      toast.error(error.message || 'Failed to send SOL');
    } finally {
      setLoading(false);
    }
  };

  // Fetch app state
  const fetchAppState = async () => {
    if (!program) return;

    try {
      const { pda: appStatePDA } = await getAppStatePDA();
      const state = await program.account.appState.fetch(appStatePDA);
      setAppState(state);
      return state;
    } catch (error) {
      console.error('Error fetching app state:', error);
      return null;
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    if (!program || !wallet.publicKey) {
      setCurrentUser(null);
      return;
    }

    try {
      const { pda: userAccountPDA } = await getUserAccountPDA(wallet.publicKey);
      const userAccount = await program.account.userAccount.fetch(userAccountPDA);
      setCurrentUser({
        ...userAccount,
        publicKey: wallet.publicKey.toString(),
      });
      return userAccount;
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUser(null);
      return null;
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    if (!program) return;

    try {
      const accounts = await program.account.userAccount.all();
      const users = accounts.map(acc => ({
        ...acc.account,
        publicKey: acc.account.owner.toString(),
      }));
      setAllUsers(users);
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  };

  // Fetch friends
  const fetchFriends = async () => {
    if (!program || !wallet.publicKey) {
      setFriends([]);
      return;
    }

    try {
      const accounts = await program.account.friendship.all();
      const userFriendships = accounts.filter(acc =>
        acc.account.user1.toString() === wallet.publicKey.toString() ||
        acc.account.user2.toString() === wallet.publicKey.toString()
      );

      const friendsList = await Promise.all(
        userFriendships.map(async (friendship) => {
          const friendPubKey = friendship.account.user1.toString() === wallet.publicKey.toString()
            ? friendship.account.user2
            : friendship.account.user1;

          const friendName = friendship.account.user1.toString() === wallet.publicKey.toString()
            ? friendship.account.user2Name
            : friendship.account.user1Name;

          try {
            const { pda: friendAccountPDA } = await getUserAccountPDA(friendPubKey);
            const friendAccount = await program.account.userAccount.fetch(friendAccountPDA);

            return {
              ...friendAccount,
              publicKey: friendPubKey.toString(),
              friendshipCreatedAt: friendship.account.createdAt,
            };
          } catch (error) {
            console.error('Error fetching friend account:', error);
            return {
              name: friendName,
              publicKey: friendPubKey.toString(),
              profilePicture: '',
              friendCount: 0,
            };
          }
        })
      );

      setFriends(friendsList);
      return friendsList;
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
      return [];
    }
  };

  // Fetch messages
  const fetchMessages = async (friendPublicKey) => {
    if (!program || !wallet.publicKey) {
      setMessages([]);
      return;
    }

    try {
      const friendPubKey = new PublicKey(friendPublicKey);
      const { pda: chatPDA } = await getChatPDA(wallet.publicKey, friendPubKey);

      try {
        const chatAccount = await program.account.chat.fetch(chatPDA);
        const messageCount = chatAccount.messageCount.toNumber();

        const messagePromises = [];
        for (let i = 0; i < messageCount; i++) {
          const { pda: messagePDA } = await getMessagePDA(chatPDA, i);
          messagePromises.push(
            program.account.message.fetch(messagePDA).catch(err => null)
          );
        }

        const messageAccounts = await Promise.all(messagePromises);
        const validMessages = messageAccounts.filter(msg => msg !== null);

        setMessages(validMessages);
        return validMessages;
      } catch (error) {
        // Chat doesn't exist yet
        setMessages([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      return [];
    }
  };

  // Load initial data when wallet connects
  useEffect(() => {
    if (wallet.publicKey && program) {
      fetchCurrentUser();
      fetchAllUsers();
      fetchFriends();
      fetchAppState();
    } else {
      setCurrentUser(null);
      setAllUsers([]);
      setFriends([]);
      setMessages([]);
      setSelectedFriend(null);
    }
  }, [wallet.publicKey, program]);

  // Auto-refresh friends and users periodically
  useEffect(() => {
    if (!wallet.publicKey || !program) return;

    const interval = setInterval(() => {
      fetchAllUsers();
      fetchFriends();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [wallet.publicKey, program]);

  // Auto-refresh messages when a friend is selected
  useEffect(() => {
    if (!selectedFriend || !wallet.publicKey || !program) {
      setMessages([]);
      return;
    }

    fetchMessages(selectedFriend.publicKey);

    const interval = setInterval(() => {
      fetchMessages(selectedFriend.publicKey);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedFriend, wallet.publicKey, program]);

  const value = {
    // State
    currentUser,
    allUsers,
    friends,
    selectedFriend,
    messages,
    loading,
    appState,
    program,

    // Actions
    setSelectedFriend,
    initializeProgram,
    createAccount,
    updateProfilePicture,
    addFriend,
    sendMessage,
    sendMediaMessage,
    sendSolWithMessage,

    // Fetch functions
    fetchCurrentUser,
    fetchAllUsers,
    fetchFriends,
    fetchMessages,
    fetchAppState,
  };

  return (
    <ChatAppContext.Provider value={value}>
      {children}
    </ChatAppContext.Provider>
  );
};
