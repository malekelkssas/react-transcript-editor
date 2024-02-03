import React from 'react';
import styles from './index.module.css';
import { timecodeToSeconds } from '../../../util/timecode-converter/index.js';
import ResizableRectangle from '../resizable-rectangle/index.js';

class SpeakerRowTimeLine extends React.Component {
  constructor(props) {
    super(props);
    this.rectangles = this.props.rectangles;
    this.mediaDuration = this.props.mediaDuration;
    this.updateQueue = [];
    this.intervalId = null;
  }
  shouldComponentUpdate(nextProps, nextState) {
    let update = false;
    if(nextProps.mediaDuration !== this.mediaDuration){
      this.mediaDuration = nextProps.mediaDuration;
      update = true;
    }
    return update;
  }

  componentDidMount() {
    this.intervalId = setInterval(this.processUpdates, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  processUpdates = () => {
    if (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift();
      this.props.updateStartAndEndTimes(update.index, update.start, update.end);
      update.setExternalUpdateToFalse();
    }
  };

  render() {
    return (
    <td className={styles.tableRow}>
        <div title={this.props.speaker} className={styles.tableSpeaker}>
          {this.props.speaker.substring(0, 5)}
        </div>
      <div className={styles.lineContainer}>
        {this.props.rectanglesIndecies.map((recIndex) => {
          const rectangle = this.props.dataBlocks[recIndex];
          return (
            <div className={styles.speakerLineRow} key={`speaker-${this.props.speaker}-rectangle-${recIndex}`}>
            <ResizableRectangle
              startTime={rectangle.start}
              endTime={rectangle.end}
              blockIndex={recIndex}
              text={rectangle.text}
              checkCollision={this.props.checkCollision}
              updateRectangle={this.props.updateRectangle}
              index={recIndex}
              mediaDuration={this.mediaDuration}
              exchangeRectanglesBlocks={this.props.exchangeRectanglesBlocks}
              updateStartAndEndTimes={this.props.updateStartAndEndTimes}
              blockIndciesPositionsSetters={this.props.blockIndciesPositionsSetters}
              updateQueue={this.updateQueue}
            />
            </div>
          );
        })}
      </div>
    </td>
    );
  }
}

export default SpeakerRowTimeLine;
