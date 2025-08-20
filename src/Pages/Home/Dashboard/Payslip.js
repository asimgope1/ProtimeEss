import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import {getObjByKey} from '../../../utils/Storage';
import SQLitePlugin from 'react-native-sqlite-2';
import {HEIGHT, WIDTH} from '../../../constants/config';
import {BLACK, WHITE, RED} from '../../../constants/color';
import Header from '../../../components/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Payslip = ({navigation}) => {
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [staffName, setStaffName] = useState('');
  const [loading, setLoading] = useState(true);
  const [slipData, setSlipData] = useState([]);

  const db = SQLitePlugin.openDatabase({
    name: 'test.db',
    version: '1.0',
    description: '',
    size: 1,
  });

  const fetchClientUrlFromSQLite = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT client_url FROM ApiResponse ORDER BY id DESC LIMIT 1',
          [],
          (_, {rows}) => {
            const url = rows.item(0)?.client_url || '';
            setClientUrl(url);
            resolve();
          },
          error => reject(error),
        );
      });
    });
  };

  const RetrieveDetails = async () => {
    try {
      const value = await getObjByKey('loginResponse');
      if (value !== null) {
        setID(value[0]?.loc_cd);
        setSl(value[0]?.staf_sl);
        setStaffName(value[0]?.staf_nm || '');
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
    }
  };

  const getSlip = async staffSl => {
    try {
      const response = await fetch(
        `${clientUrl}api/payslip?staf_sl=${encodeURIComponent(staffSl)}`,
        {method: 'GET', redirect: 'follow'},
      );
      const result = await response.json();

      if (result?.data_value) {
        setSlipData(result.data_value);
      }
    } catch (error) {
      console.error('Error fetching payslip:', error);
    } finally {
      setLoading(false);
    }
  };

  const initialize = async () => {
    try {
      await fetchClientUrlFromSQLite();
      await RetrieveDetails();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Id && Sl && clientUrl) {
      getSlip(Sl);
    }
  }, [Id, Sl, clientUrl]);

  const openPDF = url => {
    Linking.openURL(url);
  };

  // Summary calculations
  const totalPayslips = slipData.length;
  const lastNetPay = slipData[0]?.total?.trim() || '0';
  const totalEarnings = slipData
    .reduce((sum, slip) => sum + parseFloat(slip.total || 0), 0)
    .toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header title="Payslip" onBackPress={() => navigation.goBack()} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={RED} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{padding: 15}}>
            {/* Profile Section */}
            <View style={styles.profileBox}>
              <Icon name="account-circle" size={50} color="#666" />
              <View>
                <Text style={styles.staffName}>{staffName}</Text>
                <Text style={styles.staffId}>Staff ID: {Sl}</Text>
              </View>
            </View>

            {/* Summary Section */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalPayslips}</Text>
                <Text style={styles.summaryLabel}>Total Payslips</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{lastNetPay}</Text>
                <Text style={styles.summaryLabel}>Last Net Pay</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalEarnings}</Text>
                <Text style={styles.summaryLabel}>Total Earned</Text>
              </View>
            </View>

            {/* Payslip Cards */}
            {slipData.map((slip, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.month}>
                    {slip.month_name} {slip.pay_year}
                  </Text>
                  <Text style={styles.payMode}>{slip.paymode}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Icon name="cash-multiple" size={20} color="#007bff" />
                    <Text style={styles.label}>
                      Earnings:{' '}
                      <Text style={styles.value}>
                        {slip.tot_earnings.trim()}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Icon
                      name="minus-circle-outline"
                      size={20}
                      color="#d9534f"
                    />
                    <Text style={styles.label}>
                      Deductions:{' '}
                      <Text style={styles.value}>
                        {slip.tot_deduction.trim()}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Icon name="currency-inr" size={20} color="green" />
                    <Text style={styles.label}>
                      Net Pay:{' '}
                      <Text style={styles.netPay}>{slip.total.trim()}</Text>
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => openPDF(slip.pdfpath)}>
                  <Text style={styles.viewBtnText}>View PDF</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Payslip;

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {flex: 1, backgroundColor: '#f4f6f8'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  staffName: {fontSize: 18, fontWeight: 'bold', color: BLACK},
  staffId: {fontSize: 14, color: '#666', marginTop: 2},

  summaryBox: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 15,
    paddingVertical: 15,
    justifyContent: 'space-around',
  },
  summaryItem: {alignItems: 'center'},
  summaryValue: {fontSize: 18, fontWeight: 'bold', color: BLACK},
  summaryLabel: {fontSize: 12, color: '#666'},

  card: {
    backgroundColor: WHITE,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  month: {fontSize: 16, fontWeight: 'bold', color: BLACK},
  payMode: {fontSize: 12, color: '#888'},

  cardBody: {marginBottom: 10},
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  label: {marginLeft: 5, fontSize: 14, color: '#555'},
  value: {fontWeight: '500', color: BLACK},
  netPay: {fontWeight: 'bold', color: 'green'},

  viewBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewBtnText: {color: WHITE, fontSize: 14, fontWeight: 'bold'},
});
