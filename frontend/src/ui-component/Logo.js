import PropTypes from 'prop-types';
import logo from './SPOTONLOGO.jpeg';

// ==============================|| LOGO SVG ||============================== //

const Logo = ({ height, width }) => {
  return (
    <>
      <img
  height={height}
  width={width}
  src={logo}
  alt="Berry"
  style={{ borderRadius: '50%', objectFit: 'cover' }}
/>


      <h2 className="logo" style={{ color: 'black', marginRight: '3px', marginLeft: '10px' }}>
        SpotON
      </h2>
    </>
  );
};

Logo.propTypes = {
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // Accept number or string for height
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) // Accept number or string for width
};

Logo.defaultProps = {
  height: 80, // Default height if not provided
  width: 110 // Default width if not provided
};

export default Logo;
