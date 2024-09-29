import React from 'react'
import md5 from 'md5'
import querystring from 'query-string'
import isRetina from 'is-retina'
import PropTypes from 'prop-types'

class Gravatar extends React.Component {
  static displayName = 'Gravatar'
  static propTypes = {
    email: PropTypes.string,
    md5: PropTypes.string,
    size: PropTypes.number,
    rating: PropTypes.string,
    default: PropTypes.string,
    className: PropTypes.string,
    protocol: PropTypes.string,
    domain: PropTypes.string,
    style: PropTypes.object,
    fallback: PropTypes.object,
  }
  static defaultProps = {
    size: 50,
    rating: 'g',
    default: 'retro',
    protocol: '//',
    domain: 'www.gravatar.com',
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      display: 'image',
    }
  }

  _handleErrors = () => {
    if (this.props.fallback) {
      this.setState({ display: 'fallback' })
    }
  }

  render() {
    if (this.state.display === 'fallback') {
      // Fall back to another default component if the image results in a 404
      return this.props.fallback
    } else {
      const base = `${this.props.protocol}${this.props.domain}/avatar/`

      const query = querystring.stringify({
        s: this.props.size,
        r: this.props.rating,
        d: this.props.default,
      })

      const retinaQuery = querystring.stringify({
        s: this.props.size * 2,
        r: this.props.rating,
        d: this.props.default,
      })

      // Gravatar service currently trims and lowercases all registered emails
      const formattedEmail = ('' + this.props.email).trim().toLowerCase();

      let hash
      if (this.props.md5) {
        hash = this.props.md5
      } else if (typeof this.props.email === 'string') {
        hash = md5(formattedEmail, {encoding: "binary"})
      } else {
        console.warn(
          'Gravatar image can not be fetched. Either the "email" or "md5" prop must be specified.'
        )
        return (<script />)
      }

      const src = `${base}${hash}?${query}`
      const retinaSrc = `${base}${hash}?${retinaQuery}`

      let modernBrowser = true  // server-side, we render for modern browsers

      if (typeof window !== 'undefined') {
        // this is not NodeJS
        modernBrowser = 'srcset' in document.createElement('img')
      }

      let className = 'react-gravatar'
      if (this.props.className) {
        className = `${className} ${this.props.className}`
      }

      // Clone this.props and then delete Component specific props so we can
      // spread the rest into the img.
      let { ...rest } = this.props
      delete rest.md5
      delete rest.email
      delete rest.protocol
      delete rest.rating
      delete rest.size
      delete rest.style
      delete rest.className
      delete rest.default
      delete rest.fallback
      if (!modernBrowser && isRetina()) {
        return (
          <img
            alt={`Gravatar for ${formattedEmail}`}
            style={this.props.style}
            src={retinaSrc}
            height={this.props.size}
            width={this.props.size}
            {...rest}
            className={className}
            onError={() => this._handleErrors()}
          />
        )
      }
      return (
        <img
          alt={this.props.email ? `Gravatar for ${formattedEmail}` : `Gravatar`}
          style={this.props.style}
          src={src}
          srcSet={`${retinaSrc} 2x`}
          height={this.props.size}
          width={this.props.size}
          {...rest}
          className={className}
          onError={() => this._handleErrors()}
        />
      )
    }
  }
}


module.exports = Gravatar
