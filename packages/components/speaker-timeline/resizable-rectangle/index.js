import React, { Component } from 'react';
import style from './index.module.css';

class DraggableResizableRectangle extends Component {
  constructor(props) {
    super(props);

    this.state = {
      position: { x: this.mapFromTimeToPosition(this.props.startTime) },
      size: { width: Math.max(this.mapFromTimeToPosition(this.props.endTime) - this.mapFromTimeToPosition(this.props.startTime), 0.99)},
      isDragging: false,
      isResizing: false,
    };
    this.initialMouseX = null;
    this.initialPosition = null;
    this.initialSize = null;
  }

  getRectangleBoundryPosition = (x, width) => {
    return { startX: x, endX: x + width };
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseDown = (event, type) => {
    event.preventDefault();

    if (type === 'drag') {
      this.setState({ isDragging: true });
    } else if (type === 'resize') {
      this.setState({ isResizing: true });
    }

    this.initialMouseX = event.clientX;
    this.initialPosition = this.state.position.x;
    this.initialSize = this.state.size.width;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  mapFromTimeToPosition(time){
    console.log("time", time,"duration", this.props.mediaDuration,"calu", Math.floor(this.props.mediaDuration / 60) * 5);
    return ((time / 60) * 65) + 2
  }

  mapFromPositionToTime(position){
    return ((position - 2) / 65) * 60;
  }

  handleMouseMove = (event) => {
    const { isDragging, isResizing } = this.state;
    const { clientX } = event;

    if (isDragging) {
      const movementX = clientX - this.initialMouseX;
      const newXPosition = this.initialPosition + movementX;
      const {startX, endX} = this.getRectangleBoundryPosition(newXPosition, this.initialSize);
      const startTime = this.mapFromPositionToTime(startX);
      const endTime = this.mapFromPositionToTime(endX);
      if(startX >= 0 && endTime <= this.props.mediaDuration && !this.props.checkCollision(this.props.index, startTime , endTime )) {
        this.setState({
          position: {
            x: startX,
          },
        });
        this.props.updateRectangle(this.props.index, startTime, endTime);
      }
    } else if (isResizing) {
      const movementX = clientX - this.initialMouseX;
      const newSize = Math.max(this.initialSize + movementX, 0.99);
      const {startX, endX} = this.getRectangleBoundryPosition(this.initialPosition, newSize);
      const startTime = this.mapFromPositionToTime(startX);
      const endTime = this.mapFromPositionToTime(endX);
      if(startX >= 0 && endTime <= this.props.mediaDuration && !this.props.checkCollision(this.props.index, startTime , endTime )) {
      this.setState({
        size: {
          width: newSize,
        },
      });
      this.props.updateRectangle(this.props.index, startTime, endTime);
    }
    }
  };

  handleMouseUp = () => {
    this.setState({
      isDragging: false,
      isResizing: false,
    });


    this.initialMouseX = null;
    this.initialPosition = null;
    this.initialSize = null;

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  render() {
    const { position, size, isResizing } = this.state;

    return (
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: 0,
          width: size.width,
          height: "1em",
          minWidth:'1px',
          cursor: isResizing ? 'ew-resize' : 'move',
        }}
        title={this.props.text}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            cursor: 'move',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            overflow: 'hidden',
          }}
          onMouseDown={(e) => this.handleMouseDown(e, 'drag')}
        >
          <span style={{ fontSize: "10px" ,overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {this.props.text}
          </span>
        </div>
        <div
          className={style.resizer}
          onMouseDown={(e) => this.handleMouseDown(e, 'resize')}
        />
      </div>
    );
  }
}

export default DraggableResizableRectangle;
