import React from 'react';
import styles from './index.module.css';
import { secondsToTimecode, timecodeToSeconds } from '../../../util/timecode-converter/index.js';

class SpeakersCircularTimeLine extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const renderCircleTimeline = () => {
      const MINUTE_TO_SECONDS = 60;
      const MINUTE_SEGMENT = 10;
      const circles = [];
      const totalCircles = timecodeToSeconds(this.props.mediaDuration);
  
      for (let circleTime = 0; circleTime < totalCircles; circleTime++) {
        const isTalkMoment = this.props.startsObj.hasOwnProperty(circleTime);
        const isMajorLine = (circleTime % MINUTE_TO_SECONDS) === 0;
        const isMinLine = (circleTime % MINUTE_SEGMENT) === 0;

        const lineStyle = {
          height: isMajorLine ? '10px' : '5px', 
        };

        circles.push(
              <div key={`speaker-${this.props.speaker}-line-${circleTime}`} className={styles.speakerLineContainer} style={{ cursor: isTalkMoment? 'pointer':''}} onClick={()=> { if(isTalkMoment) this.props.setCurrentTime(this.props.startsObj[circleTime])}}>
                <div  className={styles.speakerContainer} >
                  {isMinLine && <div className={styles.circleItem} style={{...lineStyle, backgroundColor: isTalkMoment? "#084cc9": "#ccc"}} title={`${secondsToTimecode(this.props.startsObj[circleTime])}`} />}
                </div> 
              </div>
        );
      }
  
      return circles;
    };
     
    return (
    <tr className={styles.tableRow}>
      <td title={this.props.speaker} className={styles.tableSpeaker}>
          {this.props.speaker.substring(0, 5)}
      </td>
      <td className={styles.circleContainer}>
        <div className={styles.speakerLineRow}>{renderCircleTimeline()}</div>
      </td>
    </tr>
    );
  }
}

export default SpeakersCircularTimeLine;
