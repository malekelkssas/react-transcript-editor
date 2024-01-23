import React from 'react';
import styles from './index.module.css';
import { secondsToTimecode, timecodeToSeconds } from '../../../util/timecode-converter/index.js';

class SpeakerRowTimeLine extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const renderTimelineLines = () => {
      const MINUTE_TO_SECONDS = 60;
      const MINUTE_SEGMENT = 10;
      const lines = [];
      const totalLines = timecodeToSeconds(this.props.mediaDuration);
  
      for (let lineTime = 0; lineTime < totalLines; lineTime++) {
        const isTalkMoment = this.props.startsObj.hasOwnProperty(lineTime);
        
        const isMajorLine = (lineTime % MINUTE_TO_SECONDS) === 0;
        const isMinLine = (lineTime % MINUTE_SEGMENT) === 0;
        const lastTalkingMoment = this.props.startsObj.hasOwnProperty(lineTime - (lineTime % MINUTE_SEGMENT));
        const isLastTalkingMoment = lastTalkingMoment ? lineTime - (lineTime % MINUTE_SEGMENT) : 0;
        

        const lineStyle = {
          height: isMajorLine ? '10px' : '5px', 
        };

        lines.push(
              <div key={`speaker-${this.props.speaker}-line-${lineTime}`} className={styles.speakerLineContainer} style={{ cursor: `${isTalkMoment || lastTalkingMoment? 'pointer':''}`}} onClick={()=> { if(isTalkMoment || lastTalkingMoment) this.props.setCurrentTime(this.props.startsObj[isTalkMoment?lineTime :isLastTalkingMoment])}}>
                <div  className={styles.speakerContainer} >
                  {isMinLine && <div className={styles.lineItem} style={{...lineStyle, backgroundColor: isTalkMoment? "#084cc9": "#ccc"}} title={`${isTalkMoment || lastTalkingMoment?secondsToTimecode(this.props.startsObj[lineTime]): null}`} />}
                </div> 
              </div>
        );
      }
  
      return lines;
    };
     
    return (
    <tr className={styles.tableRow}>
      <td title={this.props.speaker} className={styles.tableSpeaker}>
          {this.props.speaker.substring(0, 5)}
      </td>
      <td className={styles.lineContainer}>
        <div className={styles.speakerLineRow}>{renderTimelineLines()}</div>
      </td>
    </tr>
    );
  }
}

export default SpeakerRowTimeLine;
