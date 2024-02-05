import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.css';
import ResizableRectangle from '../resizable-rectangle/index.js';

class SpeakerRowTimeLine extends React.Component {
  constructor(props) {
    super(props);
    this.rectangles = this.props.rectangles;
    this.mediaDuration = this.props.mediaDuration;
    this.updateQueue = [];
    this.intervalId = null;
    this.isExhangeHappened = false;
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.mediaDuration !== this.mediaDuration){
      this.mediaDuration = nextProps.mediaDuration;
      return true;
    }
    return false;
  }

  componentDidMount() {
    this.intervalId = setInterval(this.processUpdates.bind(this), 2000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  pushUpdateToQueue = (update) => {
    const { index, start, end } = update;
    this.updateQueue.push({ index, start, end });
  };

  processUpdates = () => {
    if (this.updateQueue.length > 0 && !this.isExhangeHappened) {
      const update = this.updateQueue.shift();
      this.props.updateStartAndEndTimes(update.index, update.start, update.end);
    }
  };

  removeUpdateFromQueue = (index) => {
    this.updateQueue = this.updateQueue.filter((update) => update.index !== index);
  };

  exchangeRectanglesBlocks = (blockIndex, contentToUpdate, newStartTime, newEndTime) => {
    this.isExhangeHappened = true;
    this.props.exchangeRectanglesBlocks(blockIndex, contentToUpdate, newStartTime, newEndTime);
    this.isExhangeHappened = false;
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
              blockIndex={recIndex}
              startTime={rectangle.start}
              endTime={rectangle.end}
              text={rectangle.text}
              mediaDuration={this.mediaDuration}
              checkCollision={this.props.checkCollision}
              updateRectangle={this.props.updateRectangle}
              exchangeRectanglesBlocks={this.exchangeRectanglesBlocks.bind(this)}
              pushUpdateToQueue={this.pushUpdateToQueue.bind(this)}
              removeUpdateFromQueue={this.removeUpdateFromQueue.bind(this)}
              resizableRectangleComponentHandles={this.props.resizableRectangleComponentHandles}
              getDataBlockTextByIndex={this.props.getDataBlockTextByIndex}
            />
            </div>
          );
        })}
      </div>
    </td>
    );
  }
}

SpeakerRowTimeLine.propTypes = {
  mediaDuration: PropTypes.number.isRequired,
  speaker: PropTypes.string.isRequired,
  rectanglesIndecies: PropTypes.array.isRequired,
  dataBlocks: PropTypes.array.isRequired,
  resizableRectangleComponentHandles: PropTypes.object.isRequired,
  checkCollision: PropTypes.func.isRequired,
  updateRectangle: PropTypes.func.isRequired,
  exchangeRectanglesBlocks: PropTypes.func.isRequired,
  updateStartAndEndTimes: PropTypes.func.isRequired,
  getDataBlockTextByIndex: PropTypes.func.isRequired,
};

export default SpeakerRowTimeLine;
