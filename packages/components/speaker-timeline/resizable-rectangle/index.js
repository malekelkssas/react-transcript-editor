import React, { Component } from 'react';
import style from './index.module.css';

class DraggableResizableRectangle extends Component {
  constructor(props) {
    super(props);

    this.initialMouseX = null;
    this.initialPosition = null;
    this.initialSize = null;
    this.MINUTE_WIDTH = 65;
    this.MINUTE_TO_SECOND = 60;
    this.MIN_RECTANGLE_WIDTH = 0.99;
    this.X_OFFSET = 3;
    this.ACTIONS = {
      DRAG: 'drag',
      RESIZE: 'resize',
    }
    this.DRAG_SPEED = 1;
    this.RESIZE_SPEED = 1;
    this.updateTimeout = false;
    this.timeoutId = null;
    this.state = {
      position: { x: this.mapFromTimeToPosition(this.props.startTime) },
      size: { width: Math.max(this.mapFromTimeToPosition(this.props.endTime) - this.mapFromTimeToPosition(this.props.startTime), this.MIN_RECTANGLE_WIDTH)},
      isDragging: false,
      isResizing: false,
    };
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

  componentDidUpdate(prevProps, prevState) {
    if (prevState.position.x !== this.state.position.x || prevState.size.width !== this.state.size.width) {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
      const {startX: newStart, endX: newEnd} = this.getRectangleBoundryPosition(this.state.position.x, this.state.size.width)
      this.props.updateStartAndEndTimes(
      this.props.blockKey,
      this.mapFromPositionToTime(newStart),
      this.mapFromPositionToTime(newEnd)
    );
      }, 2000);
    }
  }

  handleMouseDown = (event, type) => {
    event.preventDefault();

    if (type === this.ACTIONS.DRAG) {
      this.setState({ isDragging: true });
    } else if (type === this.ACTIONS.RESIZE) {
      this.setState({ isResizing: true });
    }

    this.initialMouseX = event.clientX;
    this.initialPosition = this.state.position.x;
    this.initialSize = this.state.size.width;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  mapFromTimeToPosition(time){
    return Math.max(((time / this.MINUTE_TO_SECOND) * this.MINUTE_WIDTH) + this.X_OFFSET, this.X_OFFSET);
  }

  mapFromPositionToTime(position){
    return Math.max(((position - this.X_OFFSET) / this.MINUTE_WIDTH) * this.MINUTE_TO_SECOND, 0);
  }

  handleMouseMove = (event) => {
    const { isDragging, isResizing } = this.state;
    const { clientX } = event;

    if (isDragging) { 
      const movementX = clientX - this.initialMouseX;
      const newXPosition = this.initialPosition + movementX * this.DRAG_SPEED;
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
      const newSize = Math.max(this.initialSize + movementX * this.RESIZE_SPEED, this.MIN_RECTANGLE_WIDTH);
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
          left: position.x,
          width: size.width,
          cursor: isResizing ? 'ew-resize' : 'move',
        }}
        className={style.rectangleContainer}
        title={this.props.text}
      >
        <div
        className={style.dragContainer}
          onMouseDown={(e) => this.handleMouseDown(e, this.ACTIONS.DRAG)}
        >
          <span className={style.dragContainerText}>
            {this.props.text}
          </span>
        </div>
        <div
          className={style.resizer}
          onMouseDown={(e) => this.handleMouseDown(e, this.ACTIONS.RESIZE)}
        />
      </div>
    );
  }
}

export default DraggableResizableRectangle;
