import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.css';
import { timecodeToSeconds } from '../../util/timecode-converter';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from '@fortawesome/free-solid-svg-icons';

class TimeLine extends React.Component {
  constructor(props) {
    super(props);

  }
 
  render() {

    const renderTimelineLines = () => {
      const MINUTE_TO_SECONDS = 60;
      const MINUTE_SEGMENT = 10;
      const totalLines = timecodeToSeconds(this.props.mediaDuration);
      const lines = [];
      for (let lineTime = 0;
         lineTime <= totalLines;
          lineTime++) {

        const isActive = lineTime <= this.props.currentTime;
        const minuteNumber = lineTime / MINUTE_TO_SECONDS;

        const lineClassName = `${styles.timeLineLine} ${isActive ? styles.timeLineLineActive : ''}`;
        const numberClassName = `${styles.timeLineNumber} ${isActive ? styles.timeLineNumberActive : ''}`;
        
        const isMajorLine = (lineTime % MINUTE_TO_SECONDS) === 0;
        const isMinLine = (lineTime % MINUTE_SEGMENT) === 0;
        const lineStyle = {
          height: isMajorLine ? '10px' : '5px', 
        };
        
        lines.push(
        <div className={styles.lineNumberContainer} key={`time-line-number-${lineTime}`} onClick={()=>this.props.setCurrentTime(lineTime)}>
          <div className={styles.lineContainer} >
            {isMinLine && <div className={lineClassName} style={lineStyle}/>}
          </div> 
          <div className={styles.numberContainer}>
            {isMajorLine && <div className={numberClassName} >{minuteNumber}</div>}
          </div> 
        </div>
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
  currentTime: PropTypes.number,
  handleAnalyticsEvents: PropTypes.func,
  videoRef: PropTypes.object.isRequired,
  mediaDuration: PropTypes.string,
  setCurrentTime: PropTypes.func,
};

export default TimeLine;
