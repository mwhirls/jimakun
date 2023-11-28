interface SubtitleProps {
    text: string,
    fontSize: number,
}

// font-family: 'Netflix Sans', 'Helvetica Nueue', 'Helvetica', 'Arial', sans-serif;
function Subtitle({ text, fontSize }: SubtitleProps) {
    const linesText = text.split('\n');
    const lines = linesText.map((text) => <div className="block text-start m-0">{text}</div>);
    const style = {
        fontSize: `${fontSize}px`,
    };
    return (
        <>
            <div style={style} className="block relative -left-1/2 font-bold drop-shadow-[0_0_7px_#000000]">
                {lines}
            </div>
        </>
    )
}
export default Subtitle;