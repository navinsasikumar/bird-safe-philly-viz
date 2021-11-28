import * as React from 'react';
import PropTypes from 'prop-types';
import Header from './header';

export default function Layout({ children }) {
  return (
    <div>
      <Header></Header>
      <div>
        <section className="container mx-auto px-6 mb-10">
          <div className="w-full lg:flex items-center">
            <div className="w-full">
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
