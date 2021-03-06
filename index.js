import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

const DEFAULT_PLACEHOLDER_STRING = 'Select...'

class Dropdown extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: props.value || {
        label: props.placeholder || DEFAULT_PLACEHOLDER_STRING,
        value: ''
      },
      isOpen: false
    }
    this.mounted = true
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
    this.fireChangeEvent = this.fireChangeEvent.bind(this)
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value && newProps.value !== this.state.selected) {
      this.setState({selected: newProps.value})
    } else if (!newProps.value) {
      this.setState({selected: { label: newProps.placeholder || DEFAULT_PLACEHOLDER_STRING, value: '' }})
    }
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false)
    document.addEventListener('touchend', this.handleDocumentClick, false)
  }

  componentWillUnmount () {
    this.mounted = false
    document.removeEventListener('click', this.handleDocumentClick, false)
    document.removeEventListener('touchend', this.handleDocumentClick, false)
  }

  handleMouseDown (event) {
    if (event.type === 'mousedown' && event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()

    if (!this.props.disabled) {
      this.setState({
        isOpen: !this.state.isOpen
      })
    }
  }

  hasValue () {
    const { options } = this.props
    const { selected } = this.state
    const selectedValue = selected.value || selected.label || selected

    return options.findIndex((option) => {
      const value = option.value || option.label || option
      return value === selectedValue
    }) >= 0;
  }

  setValue (value, label) {
    const newState = {
      selected: {
        value,
        label
      },
      isOpen: false
    }
    this.fireChangeEvent(newState)
    this.setState(newState)
  }

  fireChangeEvent (newState) {
    if (newState.selected !== this.state.selected && this.props.onChange) {
      this.props.onChange(newState.selected)
    }
  }

  renderOption (option) {
    const value = option.value || option.label || option
    const label = option.label || option.value || option

    const { selected } = this.state
    const selectedValue = selected.value || selected.label || selected

    const optionClass = classNames({
      [`${this.props.baseClassName}-option`]: true,
      'is-selected': value === selectedValue
    })

    return (
      <div
        key={value}
        className={optionClass}
        onMouseDown={this.setValue.bind(this, value, label)}
        onClick={this.setValue.bind(this, value, label)}>
        {label}
      </div>
    )
  }

  buildMenu () {
    const { options, baseClassName } = this.props
    const ops = options.map((option) => {
      if (option.type === 'group') {
        const groupTitle = (<div className={`${baseClassName}-title`}>{option.name}</div>)
        const _options = option.items.map((item) => this.renderOption(item))

        return (
          <div className={`${baseClassName}-group`} key={option.name}>
            {groupTitle}
            {_options}
          </div>
        )
      } else {
        return this.renderOption(option)
      }
    })

    return ops.length ? ops : <div className={`${baseClassName}-noresults`}>No options found</div>
  }

  handleDocumentClick (event) {
    if (this.mounted) {
      if (!ReactDOM.findDOMNode(this).contains(event.target)) {
        this.setState({ isOpen: false })
      }
    }
  }

  render () {
    const { baseClassName } = this.props
    const placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label
    const placeholderClass = classNames({ [`${baseClassName}-placeholder`]: true, 'has-value': this.hasValue() });
    const value = (<div className={placeholderClass}>{placeHolderValue}</div>)
    const menu = this.state.isOpen ? <div className={`${baseClassName}-menu`}>{this.buildMenu()}</div> : null

    const dropdownClass = classNames({
      [`${baseClassName}-root`]: true,
      'is-open': this.state.isOpen
    })

    const controlClass = classNames({
      [`${baseClassName}-control`]: true,
      [`${baseClassName}-disabled`]: this.props.disabled,
      'has-value': this.hasValue()
    });

    return (
      <div className={dropdownClass}>
        <div className={controlClass} onMouseDown={this.handleMouseDown.bind(this)} onTouchEnd={this.handleMouseDown.bind(this)}>
          {value}
          <span className={`${baseClassName}-arrow`} />
        </div>
        {menu}
      </div>
    )
  }
}

Dropdown.propTypes = {
  baseClassName: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  options: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.string),
    React.PropTypes.arrayOf(React.PropTypes.object),
  ]),
  value: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]),
  disabled: React.PropTypes.bool,
  onChange: React.PropTypes.func,
};

Dropdown.defaultProps = { baseClassName: 'Dropdown' }
export default Dropdown
