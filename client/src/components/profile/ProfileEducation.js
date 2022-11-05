import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
const ProfileEducation = ({
  education: { school, degree, fieldofstudy, current, to, from, description },
}) => {
  return (
    <div>
      <h1 className='text-dark'>{school}</h1>
      <p>
        <Moment format='YYYY/MM/DD'>{from}</Moment>-
        {!to ? 'now' : <Moment format='YYYY/MM/DD'>{to}</Moment>}
      </p>
      <p>
        <strong>Degree :</strong>
        {degree}
      </p>
      <p>
        <strong>Field of study :</strong>
        {fieldofstudy}
      </p>
      <p>
        <strong>Description :</strong>
        {description}
      </p>
    </div>
  );
};

ProfileEducation.propTypes = {
  education: PropTypes.array.isRequired,
};

export default ProfileEducation;
