import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import { Col, Row } from "antd";
import React, { useEffect } from "react";
import { TokenIcon } from "../../components/TokenIcon";
import { useConnectionConfig } from "../../contexts/connection";
import { useMarkets } from "../../contexts/market";
import { useUserBalance, useUserTotalBalance } from "../../hooks";
import { WRAPPED_SOL_MINT } from "../../utils/ids";
import { formatUSD } from "../../utils/utils";
import { LABELS } from "../../constants";
import { useConnection } from "../../contexts/connection";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import { ConnectButton } from "./../../components/ConnectButton";

export const HomeView = () => {
  const { marketEmitter, midPriceInUSD } = useMarkets();
  const { tokenMap } = useConnectionConfig();
  const SRM_ADDRESS = "EuqHfMpze6S8qXMvZaCjGypBHAgc4TZcoNwLExqsaKV8";
  const SRM = useUserBalance(SRM_ADDRESS);
  const SOL = useUserBalance(WRAPPED_SOL_MINT);
  const { balanceInUSD: totalBalanceInUSD } = useUserTotalBalance();
  const connection = useConnection();
  const { publicKey } = useWallet();

  const handleRequestAirdrop = useCallback(async () => {
    try {
      if (!publicKey) {
        return;
      }
      await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
      notify({
        message: LABELS.ACCOUNT_FUNDED,
        type: "success",
      });
    } catch (error) {
      notify({
        message: LABELS.AIRDROP_FAIL,
        type: "error",
      });
      console.error(error);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    const refreshTotal = () => {};

    const dispose = marketEmitter.onMarket(() => {
      refreshTotal();
    });

    refreshTotal();

    return () => {
      dispose();
    };
  }, [marketEmitter, midPriceInUSD, tokenMap]);

  return (
    <Row gutter={[16, 16]} align="middle">
      <Col span={24}>
        <h2>Brett's balances ({formatUSD.format(totalBalanceInUSD)}):</h2>
        <h2>
          SOL: {SOL.balance} ({formatUSD.format(SOL.balanceInUSD)})
        </h2>
      </Col>

      <Col span={12}>
        <WalletMultiButton type="ghost" />
      </Col>
      <Col span={12}>
        <div className="flexColumn" style={{ flex: 1 }}>
        <div>
          <ConnectButton type="primary" onClick={handleRequestAirdrop}>
           {LABELS.GIVE_SOL}
          </ConnectButton>
      </div>
    </div>
        </Col>
      <Col span={24}>
        <div className="builton" />
      </Col>
    </Row>
  );
};
