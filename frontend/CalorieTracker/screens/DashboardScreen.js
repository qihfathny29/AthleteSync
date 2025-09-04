import React from 'react';
import AthleteDashboard from './AthleteDashboard';
import PartnerDashboard from './PartnerDashboard';

const DashboardScreen = ({ route, navigation }) => {
  const { user } = route.params;

  // Pilih dashboard berdasarkan role
  if (user.role === 'athlete') {
    return <AthleteDashboard navigation={navigation} route={route} />;
  } else {
    return <PartnerDashboard navigation={navigation} route={route} />;
  }
};

export default DashboardScreen;