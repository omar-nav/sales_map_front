import React from 'react';

// the UI component for filtering the alcadias
export default (props) => {
  const { alcadias, filterAlcadias } = props;

  // this is the JSX that will become the Filter UI in the DOM

  return (
    < div className="filterMunicipios" >
      <h2>Ventas en Ciudad de México en 2017 de marzo a mayo</h2>
      <select defaultValue="*"
        type="select"
        name="filteralcadias"
        onChange={(e) => filterAlcadias(e)}>
        { /* render the select's option elements by maping each of the values of alcadia array to option elements */}
        {
          alcadias.map((alcadia, i) => {

            return (

              < option value={alcadia} key={i} > {alcadia}</option>
            );
          }, this)
        }
      </select>
    </div >
  );
};
