import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaYoutube,
    FaLinkedin,
    FaTiktok,
    FaApple,
    FaGoogle,
    FaAmazon,
    FaMicrosoft,
    FaUber,
    FaTwitterSquare,
    FaPaypal,
    FaSnapchat,
    FaDropbox,
    FaShopify,
    FaSpotify,
    FaAirbnb,
    FaSalesforce,
    FaSlack,
    FaStripe 
  } from "react-icons/fa";
import './Footer.css'

const Footer = () => {
  return (
    <footer className="elFooter text-light py-4">
      <div className="container-fluid px-5">
        <div className="row">
          {/* Logo y Redes Sociales */}
          <div className="col-md-3 elMarginsito yto">
            <h5 className="mb-3">Community</h5>
            <div className="socialContainer d-flex gap-3">
                <FaFacebook size={25} className="icon facebook" />
                <FaTwitter size={25} className="icon twitter" />
                <FaInstagram size={25} className="icon instagram" />
                <FaYoutube size={25} className="icon youtube" />
                <FaLinkedin size={25} className="icon linkedin" />
                <FaTiktok size={25} className="icon tiktok" />
                <FaApple size={25} className="icon apple" />
                <FaGoogle size={25} className="icon google" />
                <FaAmazon size={25} className="icon amazon" />
                <FaMicrosoft size={25} className="icon microsoft" />
                <FaUber size={25} className="icon uber" />
                <FaTwitterSquare size={25} className="icon twitter-square" />
                <FaPaypal size={25} className="icon paypal" />
                <FaSnapchat size={25} className="icon snapchat" />
                <FaDropbox size={25} className="icon dropbox" />
                <FaShopify size={25} className="icon shopify" />
                <FaSpotify size={25} className="icon spotify" />
                <FaAirbnb size={25} className="icon airbnb" />
                <FaSalesforce size={25} className="icon salesforce" />
                <FaSlack size={25} className="icon slack" />
                <FaStripe size={25} className="icon stripe" />

            </div>
          </div>
          
      {/* Enlaces Rápidos */}
<div className="col-md-3 elMarginsito">
  <h5 className="mb-3">Products</h5>
  <ul className="laLista list-unstyled">
    <li><i className="fas fa-angle-right text-warning me-2"></i> UltraTech 3000</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> FlexiGlove Pro</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> EcoMug X</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> AutoDrive 500</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> HomeFit Kit</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> SmartBot Pro</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> XVision 4K</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> QuickCharge Ultra</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> ZenTech Pad</li>
    <li><i className="fas fa-angle-right text-warning me-2"></i> SolarLux Panels</li>
  </ul>
</div>

{/* Service */}
<div className="col-md-3 elMarginsito">
  <h5 className="mb-3">Services</h5>
  <ul className="laLista list-unstyled">
    <li><i className="fas fa-angle-right text-warning me-2"></i> 24/7 Support</li>
    <small>Updated: 10 Feb, 2025</small>
    <li className="mt-2"><i className="fas fa-angle-right text-warning me-2"></i> Custom Solutions</li>
    <small>Updated: 3 May, 2024</small>
    <li className="mt-2"><i className="fas fa-angle-right text-warning me-2"></i> Express Delivery</li>
    <small>Updated: 8 Sep, 2022</small>
    <li className="mt-2"><i className="fas fa-angle-right text-warning me-2"></i> Professional Consultation</li>
    <small>Updated: 12 July, 2023</small>
  </ul>
</div>

          
          {/* Newsletter */}
          <div className="col-md-3 elMarginsito">
            <h5>Newsletter</h5>
            <div className="input-group mb-3">
              <input type="text" className="form-control" placeholder="Enter your email" />
              <span className="input-group-text bg-warning text-dark">
                <i className="fas fa-envelope"></i>
              </span>
            </div>
            <p>Subscribe to our newsletter and unlock a world of exclusive benefits. Be the first to know about our latest products, special promotions, and exciting updates.</p>
          </div>
        </div>
        
        {/* Derechos Reservados */}
        <div className="text-center mt-3">
          <small>&copy; 2025 All rights reserved</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
