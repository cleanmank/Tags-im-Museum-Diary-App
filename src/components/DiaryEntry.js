import React from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { DateTime } from "luxon";


export default function DiaryEntry(props) {

    const date = DateTime.fromISO(props.date)

    const getText = () => {

        let text = props.text;

        if(props.mark){
            return getHighlightedText(text, props.mark)
        }

        return text
    }

    const getHighlightedText = (text, highlight) => {
        // Split on highlight term and include term into parts, ignore case
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return <span> {parts.map((part, i) => 
            <span key={i} className={part.toLowerCase() === highlight.toLowerCase() ? "text-mark" : "" }>
                {part}
            </span>)
        } </span>;
    }

    return (
        <Card>
            <Card.Body>
                <h5>{date.toLocaleString(DateTime.DATE_HUGE)}</h5>
                <p>
                    {getText()}
                </p>
            </Card.Body>
        </Card>
    )
}
