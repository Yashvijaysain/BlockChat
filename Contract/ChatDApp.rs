use anchor_lang::prelude::*;

declare_id!("51TsZDgA6j8wp1zPSxTga6oLW6gj1kqxAbQQu6FxaWmn");

#[program]
pub mod chat_app {
    use super::*;

    // Initialize the program state
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let app_state = &mut ctx.accounts.app_state;
        app_state.owner = ctx.accounts.owner.key();
        app_state.total_users = 0;
        Ok(())
    }

    // Create a user account
    pub fn create_account(ctx: Context<CreateAccount>, name: String) -> Result<()> {
        require!(name.len() > 0 && name.len() <= 32, ChatError::InvalidName);

        let user_account = &mut ctx.accounts.user_account;
        let app_state = &mut ctx.accounts.app_state;

        user_account.owner = ctx.accounts.user.key();
        user_account.name = name;
        user_account.profile_picture = String::new();
        user_account.friend_count = 0;
        user_account.bump = ctx.bumps.user_account;

        app_state.total_users += 1;

        Ok(())
    }

    // Update profile picture (IPFS hash)
    pub fn update_profile_picture(
        ctx: Context<UpdateProfilePicture>,
        ipfs_hash: String,
    ) -> Result<()> {
        require!(
            ipfs_hash.len() > 0 && ipfs_hash.len() <= 64,
            ChatError::InvalidIpfsHash
        );

        let user_account = &mut ctx.accounts.user_account;
        user_account.profile_picture = ipfs_hash;

        emit!(ProfilePictureUpdated {
            user: ctx.accounts.user.key(),
            ipfs_hash: user_account.profile_picture.clone(),
        });

        Ok(())
    }

    // Add a friend
    pub fn add_friend(ctx: Context<AddFriend>, friend_name: String) -> Result<()> {
        require!(
            friend_name.len() > 0 && friend_name.len() <= 32,
            ChatError::InvalidName
        );
        require!(
            ctx.accounts.user.key() != ctx.accounts.friend.key(),
            ChatError::CannotAddSelf
        );

        let friendship = &mut ctx.accounts.friendship;
        friendship.user1 = ctx.accounts.user.key();
        friendship.user2 = ctx.accounts.friend.key();
        friendship.user1_name = ctx.accounts.user_account.name.clone();
        friendship.user2_name = friend_name;
        friendship.created_at = Clock::get()?.unix_timestamp;
        friendship.bump = ctx.bumps.friendship;

        ctx.accounts.user_account.friend_count += 1;
        ctx.accounts.friend_account.friend_count += 1;

        Ok(())
    }

    // Send text message
    pub fn send_message(ctx: Context<SendMessage>, content: String) -> Result<()> {
        require!(
            content.len() > 0 && content.len() <= 500,
            ChatError::InvalidMessageContent
        );

        let message = &mut ctx.accounts.message;
        let chat = &mut ctx.accounts.chat;

        message.sender = ctx.accounts.sender.key();
        message.timestamp = Clock::get()?.unix_timestamp;
        message.content = content;
        message.msg_type = MessageType::Text;
        message.amount = 0;
        message.metadata = String::new();
        message.message_index = chat.message_count;
        message.bump = ctx.bumps.message;

        chat.message_count += 1;
        chat.last_message_time = message.timestamp;

        emit!(MessageSent {
            sender: message.sender,
            receiver: ctx.accounts.receiver.key(),
            msg_type: MessageType::Text,
            amount: 0,
        });

        Ok(())
    }

    // Send media message (Image, Video, Audio)
    pub fn send_media_message(
        ctx: Context<SendMessage>,
        ipfs_hash: String,
        msg_type: MessageType,
        metadata: String,
    ) -> Result<()> {
        require!(
            matches!(
                msg_type,
                MessageType::Image | MessageType::Video | MessageType::Audio
            ),
            ChatError::InvalidMessageType
        );
        require!(
            ipfs_hash.len() > 0 && ipfs_hash.len() <= 64,
            ChatError::InvalidIpfsHash
        );
        require!(metadata.len() <= 200, ChatError::InvalidMetadata);

        let message = &mut ctx.accounts.message;
        let chat = &mut ctx.accounts.chat;

        message.sender = ctx.accounts.sender.key();
        message.timestamp = Clock::get()?.unix_timestamp;
        message.content = ipfs_hash.clone();
        message.msg_type = msg_type;
        message.amount = 0;
        message.metadata = metadata;
        message.message_index = chat.message_count;
        message.bump = ctx.bumps.message;

        chat.message_count += 1;
        chat.last_message_time = message.timestamp;

        emit!(MediaMessageSent {
            sender: message.sender,
            receiver: ctx.accounts.receiver.key(),
            ipfs_hash,
            msg_type,
        });

        Ok(())
    }

    // Send SOL with message
    pub fn send_sol_with_message(
        ctx: Context<SendSolWithMessage>,
        content: String,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ChatError::InvalidAmount);
        require!(content.len() <= 500, ChatError::InvalidMessageContent);

        // Transfer SOL
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.sender.key(),
            &ctx.accounts.receiver.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.sender.to_account_info(),
                ctx.accounts.receiver.to_account_info(),
            ],
        )?;

        let message = &mut ctx.accounts.message;
        let chat = &mut ctx.accounts.chat;

        message.sender = ctx.accounts.sender.key();
        message.timestamp = Clock::get()?.unix_timestamp;
        message.content = content;
        message.msg_type = MessageType::SolTransfer;
        message.amount = amount;
        message.metadata = String::new();
        message.message_index = chat.message_count;
        message.bump = ctx.bumps.message;

        chat.message_count += 1;
        chat.last_message_time = message.timestamp;

        emit!(SolTransferred {
            from: ctx.accounts.sender.key(),
            to: ctx.accounts.receiver.key(),
            amount,
        });

        emit!(MessageSent {
            sender: message.sender,
            receiver: ctx.accounts.receiver.key(),
            msg_type: MessageType::SolTransfer,
            amount,
        });

        Ok(())
    }

    // Initialize chat account between two users
    pub fn initialize_chat(ctx: Context<InitializeChat>) -> Result<()> {
        let chat = &mut ctx.accounts.chat;
        let (user1, user2) = if ctx.accounts.user1.key() < ctx.accounts.user2.key() {
            (ctx.accounts.user1.key(), ctx.accounts.user2.key())
        } else {
            (ctx.accounts.user2.key(), ctx.accounts.user1.key())
        };

        chat.user1 = user1;
        chat.user2 = user2;
        chat.message_count = 0;
        chat.last_message_time = 0;
        chat.bump = ctx.bumps.chat;

        Ok(())
    }
}

// Account Contexts

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AppState::INIT_SPACE,
        seeds = [b"app_state"],
        bump
    )]
    pub app_state: Account<'info, AppState>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateAccount<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"app_state"],
        bump
    )]
    pub app_state: Account<'info, AppState>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProfilePicture<'info> {
    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.owner == user.key() @ ChatError::Unauthorized
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddFriend<'info> {
    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.owner == user.key() @ ChatError::Unauthorized
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"user", friend.key().as_ref()],
        bump = friend_account.bump
    )]
    pub friend_account: Account<'info, UserAccount>,

    #[account(
        init,
        payer = user,
        space = 8 + Friendship::INIT_SPACE,
        seeds = [
            b"friendship",
            get_ordered_pubkeys(user.key(), friend.key()).0.as_ref(),
            get_ordered_pubkeys(user.key(), friend.key()).1.as_ref()
        ],
        bump
    )]
    pub friendship: Account<'info, Friendship>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Friend's public key, validated through friend_account
    pub friend: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeChat<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + Chat::INIT_SPACE,
        seeds = [
            b"chat",
            get_ordered_pubkeys(user1.key(), user2.key()).0.as_ref(),
            get_ordered_pubkeys(user1.key(), user2.key()).1.as_ref()
        ],
        bump
    )]
    pub chat: Account<'info, Chat>,

    /// CHECK: User 1 public key
    pub user1: AccountInfo<'info>,

    /// CHECK: User 2 public key
    pub user2: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendMessage<'info> {
    #[account(
        init,
        payer = sender,
        space = 8 + Message::INIT_SPACE,
        seeds = [
            b"message",
            chat.key().as_ref(),
            &chat.message_count.to_le_bytes()
        ],
        bump
    )]
    pub message: Account<'info, Message>,

    #[account(
        mut,
        seeds = [
            b"chat",
            get_ordered_pubkeys(sender.key(), receiver.key()).0.as_ref(),
            get_ordered_pubkeys(sender.key(), receiver.key()).1.as_ref()
        ],
        bump = chat.bump
    )]
    pub chat: Account<'info, Chat>,

    #[account(
        seeds = [b"user", sender.key().as_ref()],
        bump = sender_account.bump
    )]
    pub sender_account: Account<'info, UserAccount>,

    #[account(
        seeds = [b"user", receiver.key().as_ref()],
        bump = receiver_account.bump
    )]
    pub receiver_account: Account<'info, UserAccount>,

    // Verify friendship exists
    #[account(
        seeds = [
            b"friendship",
            get_ordered_pubkeys(sender.key(), receiver.key()).0.as_ref(),
            get_ordered_pubkeys(sender.key(), receiver.key()).1.as_ref()
        ],
        bump = friendship.bump
    )]
    pub friendship: Account<'info, Friendship>,

    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: Receiver public key, validated through receiver_account
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendSolWithMessage<'info> {
    #[account(
        init,
        payer = sender,
        space = 8 + Message::INIT_SPACE,
        seeds = [
            b"message",
            chat.key().as_ref(),
            &chat.message_count.to_le_bytes()
        ],
        bump
    )]
    pub message: Account<'info, Message>,

    #[account(
        mut,
        seeds = [
            b"chat",
            get_ordered_pubkeys(sender.key(), receiver.key()).0.as_ref(),
            get_ordered_pubkeys(sender.key(), receiver.key()).1.as_ref()
        ],
        bump = chat.bump
    )]
    pub chat: Account<'info, Chat>,

    #[account(
        seeds = [b"user", sender.key().as_ref()],
        bump = sender_account.bump
    )]
    pub sender_account: Account<'info, UserAccount>,

    #[account(
        seeds = [b"user", receiver.key().as_ref()],
        bump = receiver_account.bump
    )]
    pub receiver_account: Account<'info, UserAccount>,

    #[account(
        seeds = [
            b"friendship",
            get_ordered_pubkeys(sender.key(), receiver.key()).0.as_ref(),
            get_ordered_pubkeys(sender.key(), receiver.key()).1.as_ref()
        ],
        bump = friendship.bump
    )]
    pub friendship: Account<'info, Friendship>,

    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: Receiver public key - will receive SOL transfer
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

// Account Structures

#[account]
#[derive(InitSpace)]
pub struct AppState {
    pub owner: Pubkey,
    pub total_users: u64,
}

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub owner: Pubkey,
    #[max_len(32)]
    pub name: String,
    #[max_len(64)]
    pub profile_picture: String,
    pub friend_count: u32,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Friendship {
    pub user1: Pubkey,
    pub user2: Pubkey,
    #[max_len(32)]
    pub user1_name: String,
    #[max_len(32)]
    pub user2_name: String,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Chat {
    pub user1: Pubkey,
    pub user2: Pubkey,
    pub message_count: u64,
    pub last_message_time: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Message {
    pub sender: Pubkey,
    pub timestamp: i64,
    #[max_len(500)]
    pub content: String,
    pub msg_type: MessageType,
    pub amount: u64,
    #[max_len(200)]
    pub metadata: String,
    pub message_index: u64,
    pub bump: u8,
}

// Enums

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum MessageType {
    Text,
    Image,
    Video,
    Audio,
    SolTransfer,
}

// Events

#[event]
pub struct MessageSent {
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub msg_type: MessageType,
    pub amount: u64,
}

#[event]
pub struct MediaMessageSent {
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub ipfs_hash: String,
    pub msg_type: MessageType,
}

#[event]
pub struct SolTransferred {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ProfilePictureUpdated {
    pub user: Pubkey,
    pub ipfs_hash: String,
}

// Helper function to get ordered pubkeys
fn get_ordered_pubkeys(key1: Pubkey, key2: Pubkey) -> (Pubkey, Pubkey) {
    if key1 < key2 {
        (key1, key2)
    } else {
        (key2, key1)
    }
}

// Error Codes

#[error_code]
pub enum ChatError {
    #[msg("Invalid name: must be 1-32 characters")]
    InvalidName,

    #[msg("Invalid IPFS hash")]
    InvalidIpfsHash,

    #[msg("Invalid message content: must be 1-500 characters")]
    InvalidMessageContent,

    #[msg("Invalid message type")]
    InvalidMessageType,

    #[msg("Invalid metadata: must be 0-200 characters")]
    InvalidMetadata,

    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,

    #[msg("Users are already friends")]
    AlreadyFriends,

    #[msg("Cannot add yourself as a friend")]
    CannotAddSelf,

    #[msg("Unauthorized")]
    Unauthorized,
}
