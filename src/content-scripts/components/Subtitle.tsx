import "./Subtitle.css"

interface SubtitleProps {
    text: string
}

function Subtitle({ text }: SubtitleProps) {
    const linesText = text.split('\n');
    const lines = linesText.map((text) => <p>{text}</p>);
    return (
        <>
            <div className="jimakun-subtitle">
                {lines}
            </div>,
        </>
    )
}

export default Subtitle;