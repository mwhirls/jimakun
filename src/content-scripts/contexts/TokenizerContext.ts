import { IpadicFeatures, Tokenizer } from 'kuromoji';
import { createContext } from 'react';

interface TokenizerContextI {
    tokenizer: Tokenizer<IpadicFeatures> | null
}

export const TokenizerContext = createContext<TokenizerContextI>({
    tokenizer: null,
});