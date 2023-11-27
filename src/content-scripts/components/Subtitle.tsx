import "./Subtitle.css"

interface SubtitleProps {
    text: string,
    fontSize: number,
}

function Subtitle({ text, fontSize }: SubtitleProps) {
    const linesText = text.split('\n');
    const lines = linesText.map((text) => <div className="jimakun-line">{text}</div>);
    const style = {
        fontSize: `${fontSize}px`,
    };
    return (
        <>
            <div style={style} className="jimakun-subtitle">
                {lines}
            </div>
        </>
    )
}
export default Subtitle;