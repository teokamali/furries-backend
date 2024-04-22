export type Staking = {
  version: "0.1.0";
  name: "staking";
  instructions: [
    {
      name: "init";
      accounts: [
        {
          name: "stakeDetails";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "creator";
          isMut: true;
          isSigner: true;
        },
        {
          name: "tokenMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collectionAddress";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftAuthority";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "reward";
          type: "u64";
        },
      ];
    },
    {
      name: "stake";
      accounts: [
        {
          name: "stakeDetails";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakingRecord";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "sysvarInstructions";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftEdition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftCustody";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authRules";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenRecord";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenRecordDest";
          isMut: true;
          isSigner: false;
        },
        {
          name: "staker";
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: "stakingPeriod";
          type: "u8";
        },
      ];
    },
    {
      name: "claim";
      accounts: [
        {
          name: "stakeDetails";
          isMut: false;
          isSigner: false;
        },
        {
          name: "staker";
          isMut: true;
          isSigner: true;
        },
        {
          name: "stakingRecord";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardReceiveAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "unstake";
      accounts: [
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "sysvarInstructions";
          isMut: false;
          isSigner: false;
        },
        {
          name: "stakeDetails";
          isMut: false;
          isSigner: false;
        },
        {
          name: "staker";
          isMut: true;
          isSigner: true;
        },
        {
          name: "stakingRecord";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftReceiveAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftCustody";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftEdition";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authRules";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenRecord";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenRecordDest";
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "closeStaking";
      accounts: [
        {
          name: "stakeDetails";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "creator";
          isMut: false;
          isSigner: true;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: "deatils";
      type: {
        kind: "struct";
        fields: [
          {
            name: "initAt";
            type: "i64";
          },
          {
            name: "isActive";
            type: "bool";
          },
          {
            name: "creator";
            type: "publicKey";
          },
          {
            name: "rewardMint";
            type: "publicKey";
          },
          {
            name: "reward";
            type: "u64";
          },
          {
            name: "collection";
            type: "publicKey";
          },
          {
            name: "stakeBump";
            type: "u8";
          },
          {
            name: "tokenAuthBump";
            type: "u8";
          },
          {
            name: "nftAuthBump";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "stakingRecord";
      type: {
        kind: "struct";
        fields: [
          {
            name: "staker";
            type: "publicKey";
          },
          {
            name: "nftMint";
            type: "publicKey";
          },
          {
            name: "stakedAt";
            type: "i64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "stakingPeriod";
            type: "u8";
          },
          {
            name: "lastClaimed";
            type: "i64";
          },
        ];
      };
    },
  ];
  events: [
    {
      name: "InitEvent";
      fields: [
        {
          name: "creator";
          type: "publicKey";
          index: false;
        },
        {
          name: "collectionMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "rewardMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "initAt";
          type: "i64";
          index: false;
        },
      ];
    },
    {
      name: "StakeEvent";
      fields: [
        {
          name: "staker";
          type: "publicKey";
          index: false;
        },
        {
          name: "stakingPeriod";
          type: "u8";
          index: false;
        },
        {
          name: "stakedAt";
          type: "i64";
          index: false;
        },
        {
          name: "nftMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "collectionMint";
          type: "publicKey";
          index: false;
        },
      ];
    },
    {
      name: "ClaimEvent";
      fields: [
        {
          name: "reward";
          type: "u64";
          index: false;
        },
        {
          name: "rewardMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "collectionMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "nftMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "staker";
          type: "publicKey";
          index: false;
        },
        {
          name: "claimedAt";
          type: "i64";
          index: false;
        },
      ];
    },
    {
      name: "UnstakeEvent";
      fields: [
        {
          name: "staker";
          type: "publicKey";
          index: false;
        },
        {
          name: "stakedAt";
          type: "i64";
          index: false;
        },
        {
          name: "nftMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "collectionMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "unstakedAt";
          type: "i64";
          index: false;
        },
      ];
    },
    {
      name: "CloseEvent";
      fields: [
        {
          name: "creator";
          type: "publicKey";
          index: false;
        },
        {
          name: "rewardMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "closedAt";
          type: "i64";
          index: false;
        },
        {
          name: "collectionMint";
          type: "publicKey";
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "StakePeriodError";
      msg: "Undefined Stake Period";
    },
    {
      code: 6001;
      name: "TokenNotNFT";
      msg: "the given mint account doesn't belong to NFT";
    },
    {
      code: 6002;
      name: "TokenAccountEmpty";
      msg: "the given token account has no NFT";
    },
    {
      code: 6003;
      name: "CollectionNotVerified";
      msg: "the collection field in the metadata is not verified";
    },
    {
      code: 6004;
      name: "InvalidCollection";
      msg: "the collection doesn't match the staking details";
    },
    {
      code: 6005;
      name: "StakingInactive";
      msg: "the staking is not currently active";
    },
    {
      code: 6006;
      name: "ProgramSubError";
      msg: "Unable To Subtract";
    },
    {
      code: 6007;
      name: "ProgramMulError";
      msg: "Unable To Multiply";
    },
    {
      code: 6008;
      name: "FailedTimeConversion";
      msg: "Failed to convert the time to u64";
    },
    {
      code: 6009;
      name: "UnStakePeriodError";
      msg: "Staking Period is not over yet";
    },
    {
      code: 6010;
      name: "ClaimError";
      msg: "Claim Is Not Active yet";
    },
  ];
};
