import { IpadicFeatures } from "kuromoji";
import Token from "./Token";

interface WordProps {
    tokens: IpadicFeatures[],
}

function Word({ tokens }: WordProps) {
    const tokenElems = tokens.map((token, index) => {
        return (
            <Token key={index} token={token} />
        );
    });
    return (
        <span className="hover:text-red-500">
            {tokenElems}
        </span>
    );
}
export default Word;