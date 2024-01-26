import React from 'react';
import styles from './index.module.css';
import { timecodeToSeconds } from '../../../util/timecode-converter/index.js';
import ResizableRectangle from '../resizable-rectangle/index.js';

class SpeakerRowTimeLine extends React.Component {
  constructor(props) {
    super(props);
    this.rectangles = this.props.rectangles;
    this.mediaDuration = timecodeToSeconds(this.props.mediaDuration);
  }

  checkCollision(index, newStart, newEnd) {
    const prevRectangle = this.rectangles[index - 1];
    const nextRectangle = this.rectangles[index + 1];
    return (prevRectangle && prevRectangle.end > newStart) || (nextRectangle && nextRectangle.start < newEnd);
  }

  updateRectangle(index, newStart, newEnd) {
    this.rectangles[index] = { start: newStart, end: newEnd };
  }

  render() {
    return (
    <td className={styles.tableRow}>
        <div title={this.props.speaker} className={styles.tableSpeaker}>
          {this.props.speaker.substring(0, 5)}
        </div>
      <div className={styles.lineContainer}>
        {this.rectangles.map((rectangle, index) => (
          <div className={styles.speakerLineRow}>
          <ResizableRectangle
            key={`speaker-${this.props.speaker}-rectangle-${index}`}
            startTime={rectangle.start}
            endTime={rectangle.end}
            text={rectangle.text}
            checkCollision={this.checkCollision.bind(this)}
            updateRectangle={this.updateRectangle.bind(this)}
            index={index}
            mediaDuration={this.mediaDuration}
          />
          </div>
        ))}
      </div>
    </td>
    );
  }
}

export default SpeakerRowTimeLine;
