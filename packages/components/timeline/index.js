import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.css';
import { timecodeToSeconds } from '../../util/timecode-converter';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from '@fortawesome/free-solid-svg-icons';
import TimeLineInstant from './timeline-instant/index.js';

class TimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.MINUTE_TO_SECONDS = 60;
    this.MINUTE_SEGMENT = 10;
    this.videoRef = this.props.videoRef;
  }
 
  render() {
    const renderTimelineLines = () => {
      const totalLines = timecodeToSeconds(this.props.mediaDuration);
      const lines = [];
      for (let lineTime = 0;
         lineTime <= totalLines;
          lineTime++) {

        const minuteNumber = lineTime / this.MINUTE_TO_SECONDS;
        const isMajorLine = (lineTime % this.MINUTE_TO_SECONDS) === 0;
        const isMinLine = (lineTime % this.MINUTE_SEGMENT) === 0;
        
        
        lines.push(
          <TimeLineInstant
          key={`time-line-number-${lineTime}`}
          timeLineInstant={lineTime}
          isMinLine={isMinLine}
          isMajorLine={isMajorLine}
          setCurrentTime={this.props.setCurrentTime}
          videoRef={this.props.videoRef}
          minuteNumber={minuteNumber}
          />
          );
        }
    
        return lines;
      };
      
    return (
      <tr className={styles.tableRow} >
        <td className={styles.tableIcon}>
          <FontAwesomeIcon icon={faClock} />
        </td>
        <td className={styles.timeLine}>
          {this.props.videoRef && <div className={styles.timeLineRow}>{renderTimelineLines()}</div>}
        </td>
      </tr>
    );
  }
}

TimeLine.propTypes = {
  videoRef: PropTypes.object.isRequired,
  mediaDuration: PropTypes.string,
  setCurrentTime: PropTypes.func,
};

export default TimeLine;
