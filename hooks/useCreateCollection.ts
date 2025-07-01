// src/hooks/useDeployToken.ts
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem/utils';
import { collectionFactoryAbi, collectionFactoryAddress } from '@/lib/collectionFactoryAbi';

export function useCreateCollection() {
    const { address: owner } = useAccount();
    const { writeContractAsync, isPending } = useWriteContract();

    async function createCollection({
        name,
        symbol,
        baseURI,
        royaltyBps,
        royaltyReceiver,
        maxSupply,
        price,
        maxPerWallet,
    }: {
        name: string;
        symbol: string;
        baseURI: string;
        royaltyBps: number;
        royaltyReceiver: string;
        maxSupply: number;
        price: bigint;
        maxPerWallet: number;
    }) {
        if (!owner) throw new Error("Wallet not connected");
        
        const hash = await writeContractAsync({
            abi: collectionFactoryAbi,
            address: collectionFactoryAddress,
            functionName: 'createCollection',
            value: parseUnits("0.001", 18),
            args: [
                name,
                symbol,
                baseURI,
                royaltyBps,
                royaltyReceiver,
                maxSupply,
                price,
                maxPerWallet,
            ],
        });
        return hash;
    }
    return { createCollection, isPending };
}
