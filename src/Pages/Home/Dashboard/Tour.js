// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   KeyboardAvoidingView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import DropDownPicker from 'react-native-dropdown-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import Header from '../../../components/Header';
// import {getObjByKey} from '../../../utils/Storage';
// import SQLitePlugin from 'react-native-sqlite-2';
// import {CheckBox} from 'react-native-elements';

// const COLORS = {
//   PRIMARY: '#4361EE',
//   PRIMARY_LIGHT: '#4895EF',
//   PRIMARY_DARK: '#3A0CA3',
//   SECONDARY: '#7209B7',
//   SECONDARY_LIGHT: '#B5179E',
//   SUCCESS: '#4CC9F0',
//   WARNING: '#F72585',
//   DANGER: '#FB5607',
//   WHITE: '#FFFFFF',
//   LIGHT_GRAY: '#F8F9FA',
//   MEDIUM_GRAY: '#E9ECEF',
//   GRAY: '#DEE2E6',
//   DARK_GRAY: '#ADB5BD',
//   BLACK: '#212529',
//   BACKGROUND: '#F8F9FA',
//   CARD_BACKGROUND: '#FFFFFF',
//   TEXT_PRIMARY: '#212529',
//   TEXT_SECONDARY: '#6C757D',
//   TEXT_LIGHT: '#FFFFFF',
// };

// const Tour = ({navigation}) => {
//   // Initialize database
//   const db = SQLitePlugin.openDatabase({
//     name: 'test.db',
//     version: '1.0',
//     description: '',
//     size: 1,
//   });

//   const [clientUrl, setClientUrl] = useState('');
//   const [Id, setID] = useState();
//   const [Sl, setSl] = useState();
//   const [userData, setUserData] = useState(null);

//   // Form states
//   const [tourTitle, setTourTitle] = useState('');
//   const [tourDescription, setTourDescription] = useState('');
//   const [fromDate, setFromDate] = useState(new Date());
//   const [toDate, setToDate] = useState(new Date());
//   const [fromTime, setFromTime] = useState(new Date());
//   const [toTime, setToTime] = useState(new Date());
//   const [requestAdvance, setRequestAdvance] = useState(false);
//   const [advanceAmount, setAdvanceAmount] = useState('');

//   // Date picker states
//   const [showFromDatePicker, setShowFromDatePicker] = useState(false);
//   const [showToDatePicker, setShowToDatePicker] = useState(false);
//   const [showFromTimePicker, setShowFromTimePicker] = useState(false);
//   const [showToTimePicker, setShowToTimePicker] = useState(false);
//   const [showTripDatePicker, setShowTripDatePicker] = useState(false);
//   const [showTripFromTimePicker, setShowTripFromTimePicker] = useState(false);
//   const [showTripToTimePicker, setShowTripToTimePicker] = useState(false);
//   const [showExpenseDatePicker, setShowExpenseDatePicker] = useState(false);

//   // Dropdown states
//   const [modeOpen, setModeOpen] = useState(false);
//   const [modeValue, setModeValue] = useState(null);
//   const [modeItems] = useState([
//     {label: 'Car', value: 'car'},
//     {label: 'Bus', value: 'bus'},
//     {label: 'Train', value: 'train'},
//     {label: 'Flight', value: 'flight'},
//     {label: 'Bike', value: 'bike'},
//   ]);

//   const [locationOpen, setLocationOpen] = useState(false);
//   const [locationValue, setLocationValue] = useState(null);
//   const [locationItems] = useState([
//     {label: 'Tier-1 Kolkata', value: 'kolkata'},
//     {label: 'Tier-2 Bhubaneswar', value: 'bhubaneswar'},
//     {label: 'Tier-2 Pune', value: 'pune'},
//     {label: 'Tier-3 Cuttack', value: 'cuttack'},
//   ]);

//   const [expenseNameOpen, setExpenseNameOpen] = useState(false);
//   const [expenseNameValue, setExpenseNameValue] = useState(null);
//   const [expenseNameItems] = useState([
//     {label: 'Food', value: 'food'},
//     {label: 'Transport', value: 'transport'},
//     {label: 'Accommodation', value: 'accommodation'},
//     {label: 'Miscellaneous', value: 'miscellaneous'},
//   ]);

//   const [nighthaltOpen, setNighthaltOpen] = useState(false);
//   const [nighthaltValue, setNighthaltValue] = useState('no');
//   const [nighthaltItems] = useState([
//     {label: 'No', value: 'no'},
//     {label: 'At Hotel', value: 'hotel'},
//     {label: 'At Customer Site', value: 'customer_site'},
//   ]);

//   // Trip details table data
//   const [tripDetails, setTripDetails] = useState([]);
//   const [tripDate, setTripDate] = useState(new Date());
//   const [tripFromTime, setTripFromTime] = useState(new Date());
//   const [tripToTime, setTripToTime] = useState(new Date());
//   const [particulars, setParticulars] = useState('');
//   const [km, setKm] = useState('');

//   // Expense table data
//   const [expenses, setExpenses] = useState([]);
//   const [expenseDate, setExpenseDate] = useState(new Date());
//   const [fromLocation, setFromLocation] = useState('');
//   const [toLocation, setToLocation] = useState('');
//   const [amount, setAmount] = useState('');
//   const [expenseParticulars, setExpenseParticulars] = useState('');

//   // SQLite functions
//   const fetchClientUrlFromSQLite = () => {
//     return new Promise((resolve, reject) => {
//       db.transaction(tx => {
//         tx.executeSql(
//           'SELECT client_url FROM ApiResponse ORDER BY id DESC LIMIT 1',
//           [],
//           (_, {rows}) => {
//             const url = rows.item(0)?.client_url || '';
//             setClientUrl(url);
//             resolve(url);
//           },
//           error => {
//             console.error('Error fetching client_url:', error);
//             reject(error);
//           },
//         );
//       });
//     });
//   };

//   const RetrieveDetails = async () => {
//     try {
//       const value = await getObjByKey('loginResponse');
//       if (value !== null) {
//         setID(value[0]?.loc_cd);
//         setSl(value[0]?.staf_sl);
//         setUserData(value[0]);
//         return value[0]?.staf_sl;
//       }
//     } catch (e) {
//       console.error('Error retrieving details:', e);
//       throw e;
//     }
//   };

//   // Initialize database tables
//   useEffect(() => {
//     const initializeDatabase = async () => {
//       try {
//         await fetchClientUrlFromSQLite();
//         await RetrieveDetails();

//         // Create tables if they don't exist
//         db.transaction(tx => {
//           tx.executeSql(
//             'CREATE TABLE IF NOT EXISTS tours (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, from_date TEXT, to_date TEXT, from_time TEXT, to_time TEXT, request_advance INTEGER, advance_amount TEXT, created_by INTEGER)',
//             [],
//             () => console.log('Tour table created'),
//             error => console.log('Error creating tour table: ', error),
//           );

//           tx.executeSql(
//             'CREATE TABLE IF NOT EXISTS trip_details (id INTEGER PRIMARY KEY AUTOINCREMENT, tour_id INTEGER, date TEXT, from_time TEXT, to_time TEXT, mode TEXT, particulars TEXT, km TEXT, nighthalt TEXT, location TEXT)',
//             [],
//             () => console.log('Trip details table created'),
//             error => console.log('Error creating trip details table: ', error),
//           );

//           tx.executeSql(
//             'CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, tour_id INTEGER, date TEXT, expense_name TEXT, from_location TEXT, to_location TEXT, amount TEXT, particulars TEXT, attachment TEXT)',
//             [],
//             () => console.log('Expenses table created'),
//             error => console.log('Error creating expenses table: ', error),
//           );
//         });
//       } catch (error) {
//         console.error('Error initializing database:', error);
//       }
//     };

//     initializeDatabase();
//   }, []);

//   // Date and time picker handlers
//   const handleFromDateChange = (event, selectedDate) => {
//     setShowFromDatePicker(false);
//     if (selectedDate) setFromDate(selectedDate);
//   };

//   const handleToDateChange = (event, selectedDate) => {
//     setShowToDatePicker(false);
//     if (selectedDate) setToDate(selectedDate);
//   };

//   const handleFromTimeChange = (event, selectedTime) => {
//     setShowFromTimePicker(false);
//     if (selectedTime) setFromTime(selectedTime);
//   };

//   const handleToTimeChange = (event, selectedTime) => {
//     setShowToTimePicker(false);
//     if (selectedTime) setToTime(selectedTime);
//   };

//   const handleTripDateChange = (event, selectedDate) => {
//     setShowTripDatePicker(false);
//     if (selectedDate) setTripDate(selectedDate);
//   };

//   const handleTripFromTimeChange = (event, selectedTime) => {
//     setShowTripFromTimePicker(false);
//     if (selectedTime) setTripFromTime(selectedTime);
//   };

//   const handleTripToTimeChange = (event, selectedTime) => {
//     setShowTripToTimePicker(false);
//     if (selectedTime) setTripToTime(selectedTime);
//   };

//   const handleExpenseDateChange = (event, selectedDate) => {
//     setShowExpenseDatePicker(false);
//     if (selectedDate) setExpenseDate(selectedDate);
//   };

//   // Format date for display
//   const formatDate = date => date.toLocaleDateString();

//   // Format time for display
//   const formatTime = date =>
//     date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

//   // Format date for database (YYYY-MM-DD)
//   const formatDateForDB = date => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   // Add trip detail to table
//   const addTripDetail = () => {
//     if (!modeValue || !locationValue) {
//       Alert.alert('Error', 'Please select mode and location');
//       return;
//     }

//     const newDetail = {
//       id: Date.now().toString(),
//       date: formatDateForDB(tripDate),
//       fromTime: formatTime(tripFromTime),
//       toTime: formatTime(tripToTime),
//       mode: modeValue,
//       particulars,
//       km,
//       nighthalt: nighthaltValue,
//       location: locationValue,
//     };

//     setTripDetails([...tripDetails, newDetail]);

//     // Reset form
//     setTripDate(new Date());
//     setTripFromTime(new Date());
//     setTripToTime(new Date());
//     setModeValue(null);
//     setParticulars('');
//     setKm('');
//     setNighthaltValue('no');
//     setLocationValue(null);
//   };

//   // Add expense to table
//   const addExpense = () => {
//     if (!expenseNameValue || !amount) {
//       Alert.alert('Error', 'Please select expense name and enter amount');
//       return;
//     }

//     const newExpense = {
//       id: Date.now().toString(),
//       date: formatDateForDB(expenseDate),
//       expenseName: expenseNameValue,
//       fromLocation,
//       toLocation,
//       amount,
//       particulars: expenseParticulars,
//       attachment: '',
//     };

//     setExpenses([...expenses, newExpense]);

//     // Reset form
//     setExpenseDate(new Date());
//     setExpenseNameValue(null);
//     setFromLocation('');
//     setToLocation('');
//     setAmount('');
//     setExpenseParticulars('');
//   };

//   // Save all data to database
//   const saveTourData = () => {
//     if (!tourTitle) {
//       Alert.alert('Error', 'Please enter a tour title');
//       return;
//     }

//     if (!Sl) {
//       Alert.alert('Error', 'User information not available');
//       return;
//     }

//     db.transaction(tx => {
//       // Insert tour data
//       tx.executeSql(
//         'INSERT INTO tours (title, description, from_date, to_date, from_time, to_time, request_advance, advance_amount, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//         [
//           tourTitle,
//           tourDescription,
//           formatDateForDB(fromDate),
//           formatDateForDB(toDate),
//           formatTime(fromTime),
//           formatTime(toTime),
//           requestAdvance ? 1 : 0,
//           advanceAmount,
//           Sl,
//         ],
//         (_, result) => {
//           const tourId = result.insertId;

//           // Insert trip details
//           tripDetails.forEach(detail => {
//             tx.executeSql(
//               'INSERT INTO trip_details (tour_id, date, from_time, to_time, mode, particulars, km, nighthalt, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//               [
//                 tourId,
//                 detail.date,
//                 detail.fromTime,
//                 detail.toTime,
//                 detail.mode,
//                 detail.particulars,
//                 detail.km,
//                 detail.nighthalt,
//                 detail.location,
//               ],
//             );
//           });

//           // Insert expenses
//           expenses.forEach(expense => {
//             tx.executeSql(
//               'INSERT INTO expenses (tour_id, date, expense_name, from_location, to_location, amount, particulars, attachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//               [
//                 tourId,
//                 expense.date,
//                 expense.expenseName,
//                 expense.fromLocation,
//                 expense.toLocation,
//                 expense.amount,
//                 expense.particulars,
//                 expense.attachment,
//               ],
//             );
//           });

//           Alert.alert('Success', 'Tour data saved successfully');

//           // Reset form
//           setTourTitle('');
//           setTourDescription('');
//           setFromDate(new Date());
//           setToDate(new Date());
//           setFromTime(new Date());
//           setToTime(new Date());
//           setRequestAdvance(false);
//           setAdvanceAmount('');
//           setTripDetails([]);
//           setExpenses([]);
//         },
//         (_, error) => {
//           console.log('Error saving tour data: ', error);
//           Alert.alert('Error', 'Failed to save tour data');
//         },
//       );
//     });
//   };

//   // Render table row with serial number
//   const renderTableRow = (data, index, isTripDetail = true) => {
//     if (isTripDetail) {
//       return (
//         <View key={data.id} style={styles.tableRow}>
//           <Text style={[styles.tableCell, styles.serialCell]}>{index + 1}</Text>
//           <Text style={styles.tableCell}>{data.date}</Text>
//           <Text style={styles.tableCell}>{data.fromTime}</Text>
//           <Text style={styles.tableCell}>{data.toTime}</Text>
//           <Text style={styles.tableCell}>{data.mode}</Text>
//           <Text style={styles.tableCell}>{data.km}</Text>
//           <Text style={styles.tableCell}>{data.nighthalt}</Text>
//           <Text style={styles.tableCell}>{data.location}</Text>
//           <Text style={styles.tableCell}>{data.particulars}</Text>
//         </View>
//       );
//     } else {
//       return (
//         <View key={data.id} style={styles.tableRow}>
//           <Text style={[styles.tableCell, styles.serialCell]}>{index + 1}</Text>
//           <Text style={styles.tableCell}>{data.date}</Text>
//           <Text style={styles.tableCell}>{data.expenseName}</Text>
//           <Text style={styles.tableCell}>{data.amount}</Text>
//           <Text style={styles.tableCell}>{data.fromLocation}</Text>
//           <Text style={styles.tableCell}>{data.toLocation}</Text>
//           <Text style={styles.tableCell}>{data.particulars}</Text>
//         </View>
//       );
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         barStyle="dark-content"
//         translucent
//         backgroundColor="transparent"
//       />
//       <KeyboardAvoidingView
//         style={styles.flex}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//         <ScrollView
//           contentContainerStyle={styles.scrollContainer}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled">
//           <Header title="Tour" onBackPress={() => navigation.goBack()} />

//           {/* Tour Basic Information */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Tour Information</Text>

//             <TextInput
//               style={styles.input}
//               placeholderTextColor={COLORS.TEXT_SECONDARY}
//               placeholder="Tour Title"
//               value={tourTitle}
//               onChangeText={setTourTitle}
//             />

//             <TextInput
//               style={[styles.input, styles.textArea]}
//               placeholderTextColor={COLORS.TEXT_SECONDARY}
//               placeholder="Tour Description"
//               value={tourDescription}
//               onChangeText={setTourDescription}
//               multiline
//             />

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>From Date</Text>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setShowFromDatePicker(true)}>
//                   <Text style={{color: COLORS.TEXT_PRIMARY}}>
//                     {formatDate(fromDate)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>To Date</Text>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setShowToDatePicker(true)}>
//                   <Text style={{color: COLORS.TEXT_PRIMARY}}>
//                     {formatDate(toDate)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>From Time</Text>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setShowFromTimePicker(true)}>
//                   <Text style={{color: COLORS.TEXT_PRIMARY}}>
//                     {formatTime(fromTime)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>To Time</Text>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setShowToTimePicker(true)}>
//                   <Text style={{color: COLORS.TEXT_PRIMARY}}>
//                     {formatTime(toTime)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.checkboxContainer}>
//               <CheckBox
//                 checked={requestAdvance}
//                 onPress={() => setRequestAdvance(!requestAdvance)}
//               />
//               <Text style={styles.checkboxLabel}>Request for Advance</Text>
//             </View>

//             {requestAdvance && (
//               <TextInput
//                 style={styles.input}
//                 placeholderTextColor={COLORS.TEXT_SECONDARY}
//                 placeholder="Advance Amount"
//                 value={advanceAmount}
//                 onChangeText={setAdvanceAmount}
//                 keyboardType="numeric"
//               />
//             )}

//             {/* DateTime Pickers */}
//             {showFromDatePicker && (
//               <DateTimePicker
//                 value={fromDate}
//                 mode="date"
//                 display="default"
//                 onChange={handleFromDateChange}
//               />
//             )}

//             {showToDatePicker && (
//               <DateTimePicker
//                 value={toDate}
//                 mode="date"
//                 display="default"
//                 onChange={handleToDateChange}
//               />
//             )}

//             {showFromTimePicker && (
//               <DateTimePicker
//                 value={fromTime}
//                 mode="time"
//                 display="default"
//                 onChange={handleFromTimeChange}
//               />
//             )}

//             {showToTimePicker && (
//               <DateTimePicker
//                 value={toTime}
//                 mode="time"
//                 display="default"
//                 onChange={handleToTimeChange}
//               />
//             )}
//           </View>

//           {/* Add Trip Details Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Add Trip Details</Text>

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>Date</Text>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setShowTripDatePicker(true)}>
//                   <Text style={{color: COLORS.TEXT_PRIMARY}}>
//                     {formatDate(tripDate)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>Mode</Text>
//                 <DropDownPicker
//                   open={modeOpen}
//                   value={modeValue}
//                   items={modeItems}
//                   setOpen={setModeOpen}
//                   setValue={setModeValue}
//                   placeholder="Select Mode"
//                   style={styles.dropdown}
//                   dropDownContainerStyle={styles.dropdownList}
//                   zIndex={3000}
//                   zIndexInverse={1000}
//                 />
//               </View>
//             </View>

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>From Time</Text>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setShowTripFromTimePicker(true)}>
//                   <Text style={{color: COLORS.TEXT_PRIMARY}}>
//                     {formatTime(tripFromTime)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>To Time</Text>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setShowTripToTimePicker(true)}>
//                   <Text style={{color: COLORS.TEXT_PRIMARY}}>
//                     {formatTime(tripToTime)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <TextInput
//               style={styles.input}
//               placeholder="Particulars"
//               placeholderTextColor={COLORS.TEXT_SECONDARY}
//               value={particulars}
//               onChangeText={setParticulars}
//             />

//             <TextInput
//               style={styles.input}
//               placeholder="KM"
//               placeholderTextColor={COLORS.TEXT_SECONDARY}
//               value={km}
//               onChangeText={setKm}
//               keyboardType="numeric"
//             />

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>Nighthalt</Text>
//                 <DropDownPicker
//                   open={nighthaltOpen}
//                   value={nighthaltValue}
//                   items={nighthaltItems}
//                   setOpen={setNighthaltOpen}
//                   setValue={setNighthaltValue}
//                   placeholder="Select Nighthalt"
//                   style={styles.dropdown}
//                   dropDownContainerStyle={styles.dropdownList}
//                   zIndex={2000}
//                   zIndexInverse={2000}
//                 />
//               </View>

//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>Location</Text>
//                 <DropDownPicker
//                   open={locationOpen}
//                   value={locationValue}
//                   items={locationItems}
//                   setOpen={setLocationOpen}
//                   setValue={setLocationValue}
//                   placeholder="Select Location"
//                   style={styles.dropdown}
//                   dropDownContainerStyle={styles.dropdownList}
//                   zIndex={1000}
//                   zIndexInverse={3000}
//                 />
//               </View>
//             </View>

//             {showTripDatePicker && (
//               <DateTimePicker
//                 value={tripDate}
//                 mode="date"
//                 display="default"
//                 onChange={handleTripDateChange}
//               />
//             )}

//             {showTripFromTimePicker && (
//               <DateTimePicker
//                 value={tripFromTime}
//                 mode="time"
//                 display="default"
//                 onChange={handleTripFromTimeChange}
//               />
//             )}

//             {showTripToTimePicker && (
//               <DateTimePicker
//                 value={tripToTime}
//                 mode="time"
//                 display="default"
//                 onChange={handleTripToTimeChange}
//               />
//             )}

//             <TouchableOpacity style={styles.addButton} onPress={addTripDetail}>
//               <Text style={styles.addButtonText}>Add Trip Detail</Text>
//             </TouchableOpacity>

//             {/* Trip Details Table */}
//             {tripDetails.length > 0 && (
//               <View style={styles.tableContainer}>
//                 <Text style={styles.tableTitle}>Trip Details</Text>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={true}>
//                   <View>
//                     <View style={styles.tableHeader}>
//                       <Text style={[styles.tableHeaderCell, styles.serialCell]}>
//                         S.No
//                       </Text>
//                       <Text style={styles.tableHeaderCell}>Date</Text>
//                       <Text style={styles.tableHeaderCell}>From Time</Text>
//                       <Text style={styles.tableHeaderCell}>To Time</Text>
//                       <Text style={styles.tableHeaderCell}>Mode</Text>
//                       <Text style={styles.tableHeaderCell}>KM</Text>
//                       <Text style={styles.tableHeaderCell}>Nighthalt</Text>
//                       <Text style={styles.tableHeaderCell}>Location</Text>
//                       <Text style={styles.tableHeaderCell}>Particulars</Text>
//                     </View>
//                     {tripDetails.map((detail, index) =>
//                       renderTableRow(detail, index, true),
//                     )}
//                   </View>
//                 </ScrollView>
//               </View>
//             )}
//           </View>

//           {/* Add Expenses Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Add Expenses</Text>

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>Date</Text>
//                 <TouchableOpacity
//                   style={styles.dateInput}
//                   onPress={() => setShowExpenseDatePicker(true)}>
//                   <Text style={{color: COLORS.TEXT_PRIMARY}}>
//                     {formatDate(expenseDate)}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>Expense Name</Text>
//                 <DropDownPicker
//                   open={expenseNameOpen}
//                   value={expenseNameValue}
//                   items={expenseNameItems}
//                   setOpen={setExpenseNameOpen}
//                   setValue={setExpenseNameValue}
//                   placeholder="Select Expense"
//                   style={styles.dropdown}
//                   dropDownContainerStyle={styles.dropdownList}
//                   zIndex={3000}
//                   zIndexInverse={1000}
//                 />
//               </View>
//             </View>

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="From Location"
//                   placeholderTextColor={COLORS.TEXT_SECONDARY}
//                   value={fromLocation}
//                   onChangeText={setFromLocation}
//                 />
//               </View>

//               <View style={styles.halfInput}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="To Location"
//                   placeholderTextColor={COLORS.TEXT_SECONDARY}
//                   value={toLocation}
//                   onChangeText={setToLocation}
//                 />
//               </View>
//             </View>

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Amount"
//                   placeholderTextColor={COLORS.TEXT_SECONDARY}
//                   value={amount}
//                   onChangeText={setAmount}
//                   keyboardType="numeric"
//                 />
//               </View>

//               <View style={styles.halfInput}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Particulars"
//                   placeholderTextColor={COLORS.TEXT_SECONDARY}
//                   value={expenseParticulars}
//                   onChangeText={setExpenseParticulars}
//                 />
//               </View>
//             </View>

//             {/* Expense Date Picker */}
//             {showExpenseDatePicker && (
//               <DateTimePicker
//                 value={expenseDate}
//                 mode="date"
//                 display="default"
//                 onChange={handleExpenseDateChange}
//               />
//             )}

//             <TouchableOpacity style={styles.addButton} onPress={addExpense}>
//               <Text style={styles.addButtonText}>Add Expense</Text>
//             </TouchableOpacity>

//             {/* Expenses Table */}
//             {expenses.length > 0 && (
//               <View style={styles.tableContainer}>
//                 <Text style={styles.tableTitle}>Expenses</Text>
//                 <ScrollView horizontal showsHorizontalScrollIndicator={true}>
//                   <View>
//                     <View style={styles.tableHeader}>
//                       <Text style={[styles.tableHeaderCell, styles.serialCell]}>
//                         S.No
//                       </Text>
//                       <Text style={styles.tableHeaderCell}>Date</Text>
//                       <Text style={styles.tableHeaderCell}>Expense</Text>
//                       <Text style={styles.tableHeaderCell}>Amount</Text>
//                       <Text style={styles.tableHeaderCell}>From Location</Text>
//                       <Text style={styles.tableHeaderCell}>To Location</Text>
//                       <Text style={styles.tableHeaderCell}>Particulars</Text>
//                     </View>
//                     {expenses.map((expense, index) =>
//                       renderTableRow(expense, index, false),
//                     )}
//                   </View>
//                 </ScrollView>
//               </View>
//             )}
//           </View>

//           {/* Save Button */}
//           <TouchableOpacity style={styles.saveButton} onPress={saveTourData}>
//             <Text style={styles.saveButtonText}>Save Tour Data</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.BACKGROUND,
//   },
//   scrollContainer: {
//     paddingBottom: 20,
//   },
//   flex: {
//     flex: 1,
//   },
//   section: {
//     padding: 16,
//     marginBottom: 16,
//     backgroundColor: COLORS.CARD_BACKGROUND,
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: COLORS.BLACK,
//     shadowOffset: {width: 0, height: 1},
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.TEXT_PRIMARY,
//     marginBottom: 16,
//   },
//   input: {
//     color: COLORS.BLACK,
//     backgroundColor: COLORS.LIGHT_GRAY,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: COLORS.GRAY,
//   },
//   textArea: {
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   halfInput: {
//     width: '48%',
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.TEXT_PRIMARY,
//     marginBottom: 8,
//   },
//   dateInput: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: COLORS.LIGHT_GRAY,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: COLORS.GRAY,
//     minHeight: 50,
//   },
//   checkboxContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   checkboxLabel: {
//     fontSize: 16,
//     color: COLORS.TEXT_PRIMARY,
//     marginLeft: 8,
//   },
//   dropdown: {
//     backgroundColor: COLORS.LIGHT_GRAY,
//     borderColor: COLORS.GRAY,
//     borderRadius: 8,
//     marginBottom: 16,
//     minHeight: 50,
//   },
//   dropdownList: {
//     backgroundColor: COLORS.LIGHT_GRAY,
//     borderColor: COLORS.GRAY,
//   },
//   addButton: {
//     backgroundColor: COLORS.PRIMARY,
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   addButtonText: {
//     color: COLORS.WHITE,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   tableContainer: {
//     marginTop: 16,
//     borderWidth: 1,
//     borderColor: COLORS.GRAY,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   tableTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     padding: 8,
//     backgroundColor: COLORS.PRIMARY_LIGHT,
//     color: COLORS.WHITE,
//     textAlign: 'center',
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.PRIMARY,
//   },
//   tableHeaderCell: {
//     padding: 12,
//     color: COLORS.WHITE,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     minWidth: 100,
//     borderRightWidth: 1,
//     borderRightColor: COLORS.WHITE,
//   },
//   serialCell: {
//     minWidth: 60,
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.GRAY,
//     backgroundColor: COLORS.LIGHT_GRAY,
//   },
//   tableCell: {
//     padding: 12,
//     textAlign: 'center',
//     color: COLORS.TEXT_PRIMARY,
//     minWidth: 100,
//     borderRightWidth: 1,
//     borderRightColor: COLORS.GRAY,
//   },
//   saveButton: {
//     backgroundColor: COLORS.SUCCESS,
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     margin: 16,
//   },
//   saveButtonText: {
//     color: COLORS.WHITE,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default Tour;








import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../../../components/Header';
import {getObjByKey} from '../../../utils/Storage';
import SQLitePlugin from 'react-native-sqlite-2';
import {CheckBox} from 'react-native-elements';

const COLORS = {
  PRIMARY: '#4361EE',
  PRIMARY_LIGHT: '#4895EF',
  PRIMARY_DARK: '#3A0CA3',
  SECONDARY: '#7209B7',
  SECONDARY_LIGHT: '#B5179E',
  SUCCESS: '#4CC9F0',
  WARNING: '#F72585',
  DANGER: '#FB5607',
  WHITE: '#FFFFFF',
  LIGHT_GRAY: '#F8F9FA',
  MEDIUM_GRAY: '#E9ECEF',
  GRAY: '#DEE2E6',
  DARK_GRAY: '#ADB5BD',
  BLACK: '#212529',
  BACKGROUND: '#F8F9FA',
  CARD_BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#212529',
  TEXT_SECONDARY: '#6C757D',
  TEXT_LIGHT: '#FFFFFF',
};

const Tour = ({navigation, route}) => {
  // Initialize database
  const db = SQLitePlugin.openDatabase({
    name: 'test.db',
    version: '1.0',
    description: '',
    size: 1,
  });

  const [clientUrl, setClientUrl] = useState('https://protimes.co.in/test');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tourId, setTourId] = useState(null);

  // Form states
  const [tourTitle, setTourTitle] = useState('');
  const [tourDescription, setTourDescription] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [requestAdvance, setRequestAdvance] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');

  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [showTripDatePicker, setShowTripDatePicker] = useState(false);
  const [showTripFromTimePicker, setShowTripFromTimePicker] = useState(false);
  const [showTripToTimePicker, setShowTripToTimePicker] = useState(false);
  const [showExpenseDatePicker, setShowExpenseDatePicker] = useState(false);

  // Dropdown states
  const [modeOpen, setModeOpen] = useState(false);
  const [modeValue, setModeValue] = useState(null);
  const [modeItems, setModeItems] = useState([
    {label: 'Car', value: 'car'},
    {label: 'Bus', value: 'bus'},
    {label: 'Train', value: 'train'},
    {label: 'Flight', value: 'flight'},
    {label: 'Bike', value: 'bike'},
  ]);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationValue, setLocationValue] = useState(null);
  const [locationItems, setLocationItems] = useState([]);

  const [expenseNameOpen, setExpenseNameOpen] = useState(false);
  const [expenseNameValue, setExpenseNameValue] = useState(null);
  const [expenseNameItems, setExpenseNameItems] = useState([]);

  const [nighthaltOpen, setNighthaltOpen] = useState(false);
  const [nighthaltValue, setNighthaltValue] = useState('no');
  const [nighthaltItems] = useState([
    {label: 'No', value: 'no'},
    {label: 'At Hotel', value: 'hotel'},
    {label: 'At Customer Site', value: 'customer_site'},
  ]);

  // Trip details table data
  const [tripDetails, setTripDetails] = useState([]);
  const [tripDate, setTripDate] = useState(new Date());
  const [tripFromTime, setTripFromTime] = useState(new Date());
  const [tripToTime, setTripToTime] = useState(new Date());
  const [particulars, setParticulars] = useState('');
  const [km, setKm] = useState('');

  // Expense table data
  const [expenses, setExpenses] = useState([]);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseParticulars, setExpenseParticulars] = useState('');

  // Check if we're in edit mode
  useEffect(() => {
    if (route.params?.tourId) {
      setEditMode(true);
      setTourId(route.params.tourId);
      fetchTourDetails(route.params.tourId);
    }
  }, [route.params]);

  useEffect(() => {
    if (Sl && Id) {
      fetchLocations(Id);
      fetchExpenses(Sl);
    }
  }, [Sl, Id]);

  // API Functions
const fetchLocations = async loc_cd => {
  try {
    const response = await fetch(
      `${clientUrl}/api/tourlocationlist?loc_cd=${loc_cd}`,
      {headers: {'Content-Type': 'application/json'}},
    );
    const responseText = await response.text();
    console.log('Location API Response:', responseText);

    const result = JSON.parse(responseText);
    if (result.status === 'success') {
      setLocationItems(
        result.data_value.map(location => ({
          label: location.LocationName,
          value: location.LocationName,
          tierSl: location.TierSl,
        })),
      );
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

const fetchExpenses = async staf_sl => {
  try {
    const response = await fetch(
      `${clientUrl}/api/tourexpenselist?staf_sl=${staf_sl}`,
      {headers: {'Content-Type': 'application/json'}},
    );
    const responseText = await response.text();
    console.log('Expense API Response:', responseText);

    const result = JSON.parse(responseText);
    if (result.status === 'success') {
      setExpenseNameItems(
        result.data_value.map(expense => ({
          label: expense.ExpenseName,
          value: expense.ExpenseName,
          expenseSl: expense.ExpenseSl,
          locationSpecified: expense.LocationSpecified,
          billMandatory: expense.BillMandatory,
          fromDateToDate: expense.FromDateToDate,
        })),
      );
    }
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
};


  const fetchTourDetails = async (tourId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${clientUrl}/api/GetTourDetails?TourId=${tourId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      
      if (result.status === 'success' && result.data_value.length > 0) {
        const tourData = result.data_value[0];
        
        // Set basic tour information
        setTourTitle(tourData.TourTittle || '');
        setTourDescription(tourData.TourDescription || '');
        setRequestAdvance(tourData.RequestAdvance === 1);
        setAdvanceAmount(tourData.RequestedAdvanceAmount?.toString() || '');
        
        // Set dates and times
        if (tourData.TourFrom) setFromDate(new Date(tourData.TourFrom));
        if (tourData.TourTo) setToDate(new Date(tourData.TourTo));
        
        // Set trip details
        if (tourData.travel_details) {
          const formattedTripDetails = tourData.travel_details.map(trip => ({
            id: trip.sl.toString(),
            date: formatDateForDisplay(trip.dt),
            fromTime: trip.ft,
            toTime: trip.tt,
            mode: trip.TravelMode,
            particulars: trip.Particular,
            km: trip.TotalKm?.trim(),
            nighthalt: trip.NightHalt,
            location: trip.Location
          }));
          setTripDetails(formattedTripDetails);
        }
        
        // Set expenses
        if (tourData.expense_details) {
          const formattedExpenses = tourData.expense_details.map(expense => ({
            id: expense.sl.toString(),
            date: formatDateForDisplay(expense.dt),
            expenseName: expense.ExpenseName,
            fromLocation: expense.Location,
            toLocation: expense.Location,
            amount: expense.Amount?.trim(),
            particulars: expense.Particular,
            attachment: expense.BillPath
          }));
          setExpenses(formattedExpenses);
        }
      }
    } catch (error) {
      console.error('Error fetching tour details:', error);
      Alert.alert('Error', 'Failed to load tour details');
    } finally {
      setLoading(false);
    }
  };

const submitTourData = async () => {
  try {
    setLoading(true);

    // Prepare tour data for API submission - matching the exact successful format
    const tourData = {
      staf_sl: parseInt(Sl) || 1,
      TourTittle: tourTitle,
      TourDescription: tourDescription,
      TourFrom: formatDateForDB(fromDate),
      TourFromTime: formatTime(fromTime),
      TourTo: formatDateForDB(toDate),
      TourToTime: formatTime(toTime),
      RequestAdvance: requestAdvance ? 1.0 : 0.0, // Use float format
      RequestedAdvanceAmount: advanceAmount ? parseFloat(advanceAmount) : 0.0,
      loc_cd: Id ? Id.toString() : '1', // Keep as string
      TourTravel: tripDetails.map(trip => {
        // Find the location to get the correct TierSl
        const locationItem = locationItems.find(
          item => item.value === trip.location,
        );
        return {
          TravelDate: trip.date,
          TravelFrom: trip.fromTime,
          TravelTo: trip.toTime,
          TravelMode: trip.mode,
          km: trip.km ? trip.km.toString() : '0',
          Particular: trip.particulars,
          NightHalt: trip.nighthalt,
          TierSl: locationItem ? locationItem.tierSl : 1,
          Location: trip.location,
        };
      }),
      TourExpense: expenses.map(expense => {
        // Find the expense to get the correct ExpenseSl
        const expenseItem = expenseNameItems.find(
          item => item.value === expense.expenseName,
        );
        return {
          ExpenseDate: expense.date,
          ExpenseSl: expenseItem ? expenseItem.expenseSl : 1,
          Location: expense.fromLocation,
          ExpenseFrom: expense.date,
          ExpenseTo: expense.date,
          Amount: expense.amount ? parseFloat(expense.amount) : 0.0,
          Particular: expense.particulars,
          BillFileBase64: '', // Empty string for now
        };
      }),
    };

    console.log('Submitting tour data:', JSON.stringify(tourData, null, 2));

    // Make the API call
    const response = await fetch(`${clientUrl}/api/AddTourDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tourData),
    });

    // Handle response as text first (as the API returns text)
    const responseText = await response.text();
    console.log('API Response:', responseText);

    try {
      const result = JSON.parse(responseText);

      if (result.Status === 'Success') {
        Alert.alert('Success', result.Message || 'Tour created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);

        // Also save to local database
        saveToLocalDatabase();
      } else {
        Alert.alert('Error', result.Message || 'Failed to submit tour data');
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      Alert.alert('Error', 'Invalid response from server');
    }
  } catch (error) {
    console.error('Error submitting tour:', error);
    Alert.alert('Error', 'Failed to submit tour data');
  } finally {
    setLoading(false);
  }
};

  // SQLite functions
  const fetchClientUrlFromSQLite = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT client_url FROM ApiResponse ORDER BY id DESC LIMIT 1',
          [],
          (_, {rows}) => {
            const url = rows.item(0)?.client_url || 'https://protimes.co.in/test';
            setClientUrl(url);
            resolve(url);
          },
          error => {
            console.error('Error fetching client_url:', error);
            setClientUrl('https://protimes.co.in/test');
            resolve('https://protimes.co.in/test');
          },
        );
      });
    });
  };

const RetrieveDetails = async () => {
  try {
    const value = await getObjByKey('loginResponse');
    if (value !== null) {
      const user = value[0];
      setID(user?.loc_cd);
      setSl(user?.staf_sl);
      setUserData(user);
      return user; // return whole object (with loc_cd and staf_sl)
    }
  } catch (e) {
    console.error('Error retrieving details:', e);
    throw e;
  }
};


  // Initialize database tables and fetch API data
useEffect(() => {
  const initializeData = async () => {
    try {
      await fetchClientUrlFromSQLite();
      const staffData = await RetrieveDetails(); // return both loc_cd & staf_sl

      if (staffData?.staf_sl) {
        await fetchLocations(staffData.loc_cd);
        await fetchExpenses(staffData.staf_sl);
      }

      // Create tables if they don't exist
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS tours (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            title TEXT, 
            description TEXT, 
            from_date TEXT, 
            to_date TEXT, 
            from_time TEXT, 
            to_time TEXT, 
            request_advance INTEGER, 
            advance_amount TEXT, 
            created_by INTEGER
          )`,
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS trip_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            tour_id INTEGER, 
            date TEXT, 
            from_time TEXT, 
            to_time TEXT, 
            mode TEXT, 
            particulars TEXT, 
            km TEXT, 
            nighthalt TEXT, 
            location TEXT
          )`,
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            tour_id INTEGER, 
            date TEXT, 
            expense_name TEXT, 
            from_location TEXT, 
            to_location TEXT, 
            amount TEXT, 
            particulars TEXT, 
            attachment TEXT
          )`,
        );
      });
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  initializeData();
}, []);


  // Date and time functions
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return formatDateForDB(new Date());
    
    // Handle different date formats from API
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateString;
  };

  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) setFromDate(selectedDate);
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) setToDate(selectedDate);
  };

  const handleFromTimeChange = (event, selectedTime) => {
    setShowFromTimePicker(false);
    if (selectedTime) setFromTime(selectedTime);
  };

  const handleToTimeChange = (event, selectedTime) => {
    setShowToTimePicker(false);
    if (selectedTime) setToTime(selectedTime);
  };

  const handleTripDateChange = (event, selectedDate) => {
    setShowTripDatePicker(false);
    if (selectedDate) setTripDate(selectedDate);
  };

  const handleTripFromTimeChange = (event, selectedTime) => {
    setShowTripFromTimePicker(false);
    if (selectedTime) setTripFromTime(selectedTime);
  };

  const handleTripToTimeChange = (event, selectedTime) => {
    setShowTripToTimePicker(false);
    if (selectedTime) setTripToTime(selectedTime);
  };

  const handleExpenseDateChange = (event, selectedDate) => {
    setShowExpenseDatePicker(false);
    if (selectedDate) setExpenseDate(selectedDate);
  };

  // Format date for display
  const formatDate = date => date.toLocaleDateString();

  // Format time for display
  const formatTime = date =>
    date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

  // Format date for database (YYYY-MM-DD)
  const formatDateForDB = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Add trip detail to table
  const addTripDetail = () => {
    if (!modeValue || !locationValue) {
      Alert.alert('Error', 'Please select mode and location');
      return;
    }

    const newDetail = {
      id: Date.now().toString(),
      date: formatDateForDB(tripDate),
      fromTime: formatTime(tripFromTime),
      toTime: formatTime(tripToTime),
      mode: modeValue,
      particulars,
      km,
      nighthalt: nighthaltValue,
      location: locationValue,
    };

    setTripDetails([...tripDetails, newDetail]);

    // Reset form
    setTripDate(new Date());
    setTripFromTime(new Date());
    setTripToTime(new Date());
    setModeValue(null);
    setParticulars('');
    setKm('');
    setNighthaltValue('no');
    setLocationValue(null);
  };

  // Add expense to table
  const addExpense = () => {
    if (!expenseNameValue || !amount) {
      Alert.alert('Error', 'Please select expense name and enter amount');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      date: formatDateForDB(expenseDate),
      expenseName: expenseNameValue,
      fromLocation,
      toLocation,
      amount,
      particulars: expenseParticulars,
      attachment: '',
    };

    setExpenses([...expenses, newExpense]);

    // Reset form
    setExpenseDate(new Date());
    setExpenseNameValue(null);
    setFromLocation('');
    setToLocation('');
    setAmount('');
    setExpenseParticulars('');
  };

  // Save all data to local database
  const saveToLocalDatabase = () => {
    if (!tourTitle) {
      Alert.alert('Error', 'Please enter a tour title');
      return;
    }

    if (!Sl) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    db.transaction(tx => {
      // Insert tour data
      tx.executeSql(
        'INSERT INTO tours (title, description, from_date, to_date, from_time, to_time, request_advance, advance_amount, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          tourTitle,
          tourDescription,
          formatDateForDB(fromDate),
          formatDateForDB(toDate),
          formatTime(fromTime),
          formatTime(toTime),
          requestAdvance ? 1 : 0,
          advanceAmount,
          Sl,
        ],
        (_, result) => {
          const tourId = result.insertId;

          // Insert trip details
          tripDetails.forEach(detail => {
            tx.executeSql(
              'INSERT INTO trip_details (tour_id, date, from_time, to_time, mode, particulars, km, nighthalt, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                tourId,
                detail.date,
                detail.fromTime,
                detail.toTime,
                detail.mode,
                detail.particulars,
                detail.km,
                detail.nighthalt,
                detail.location,
              ],
            );
          });

          // Insert expenses
          expenses.forEach(expense => {
            tx.executeSql(
              'INSERT INTO expenses (tour_id, date, expense_name, from_location, to_location, amount, particulars, attachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [
                tourId,
                expense.date,
                expense.expenseName,
                expense.fromLocation,
                expense.toLocation,
                expense.amount,
                expense.particulars,
                expense.attachment,
              ],
            );
          });

          console.log('Tour data saved locally');
        },
        (_, error) => {
          console.log('Error saving tour data locally: ', error);
        },
      );
    });
  };

  // Render table row with serial number
  const renderTableRow = (data, index, isTripDetail = true) => {
    if (isTripDetail) {
      return (
        <View key={data.id} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.serialCell]}>{index + 1}</Text>
          <Text style={styles.tableCell}>{data.date}</Text>
          <Text style={styles.tableCell}>{data.fromTime}</Text>
          <Text style={styles.tableCell}>{data.toTime}</Text>
          <Text style={styles.tableCell}>{data.mode}</Text>
          <Text style={styles.tableCell}>{data.km}</Text>
          <Text style={styles.tableCell}>{data.nighthalt}</Text>
          <Text style={styles.tableCell}>{data.location}</Text>
          <Text style={styles.tableCell}>{data.particulars}</Text>
        </View>
      );
    } else {
      return (
        <View key={data.id} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.serialCell]}>{index + 1}</Text>
          <Text style={styles.tableCell}>{data.date}</Text>
          <Text style={styles.tableCell}>{data.expenseName}</Text>
          <Text style={styles.tableCell}>{data.amount}</Text>
          <Text style={styles.tableCell}>{data.fromLocation}</Text>
          <Text style={styles.tableCell}>{data.toLocation}</Text>
          <Text style={styles.tableCell}>{data.particulars}</Text>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Header 
            title={editMode ? "Edit Tour" : "Create Tour"} 
            onBackPress={() => navigation.goBack()} 
          />

          {/* Tour Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tour Information</Text>

            <TextInput
              style={styles.input}
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              placeholder="Tour Title"
              value={tourTitle}
              onChangeText={setTourTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              placeholder="Tour Description"
              value={tourDescription}
              onChangeText={setTourDescription}
              multiline
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>From Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowFromDatePicker(true)}>
                  <Text style={{color: COLORS.TEXT_PRIMARY}}>
                    {formatDate(fromDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>To Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowToDatePicker(true)}>
                  <Text style={{color: COLORS.TEXT_PRIMARY}}>
                    {formatDate(toDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>From Time</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowFromTimePicker(true)}>
                  <Text style={{color: COLORS.TEXT_PRIMARY}}>
                    {formatTime(fromTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>To Time</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowToTimePicker(true)}>
                  <Text style={{color: COLORS.TEXT_PRIMARY}}>
                    {formatTime(toTime)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.checkboxContainer}>
              <CheckBox
                checked={requestAdvance}
                onPress={() => setRequestAdvance(!requestAdvance)}
              />
              <Text style={styles.checkboxLabel}>Request for Advance</Text>
            </View>

            {requestAdvance && (
              <TextInput
                style={styles.input}
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                placeholder="Advance Amount"
                value={advanceAmount}
                onChangeText={setAdvanceAmount}
                keyboardType="numeric"
              />
            )}

            {/* DateTime Pickers */}
            {showFromDatePicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={handleFromDateChange}
              />
            )}

            {showToDatePicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="default"
                onChange={handleToDateChange}
              />
            )}

            {showFromTimePicker && (
              <DateTimePicker
                value={fromTime}
                mode="time"
                display="default"
                onChange={handleFromTimeChange}
              />
            )}

            {showToTimePicker && (
              <DateTimePicker
                value={toTime}
                mode="time"
                display="default"
                onChange={handleToTimeChange}
              />
            )}
          </View>

          {/* Add Trip Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Trip Details</Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowTripDatePicker(true)}>
                  <Text style={{color: COLORS.TEXT_PRIMARY}}>
                    {formatDate(tripDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Mode</Text>
                <DropDownPicker
                  open={modeOpen}
                  value={modeValue}
                  items={modeItems}
                  setOpen={setModeOpen}
                  setValue={setModeValue}
                  placeholder="Select Mode"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownList}
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>From Time</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowTripFromTimePicker(true)}>
                  <Text style={{color: COLORS.TEXT_PRIMARY}}>
                    {formatTime(tripFromTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>To Time</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowTripToTimePicker(true)}>
                  <Text style={{color: COLORS.TEXT_PRIMARY}}>
                    {formatTime(tripToTime)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Particulars"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={particulars}
              onChangeText={setParticulars}
            />

            <TextInput
              style={styles.input}
              placeholder="KM"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={km}
              onChangeText={setKm}
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Nighthalt</Text>
                <DropDownPicker
                  open={nighthaltOpen}
                  value={nighthaltValue}
                  items={nighthaltItems}
                  setOpen={setNighthaltOpen}
                  setValue={setNighthaltValue}
                  placeholder="Select Nighthalt"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownList}
                  zIndex={2000}
                  zIndexInverse={2000}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Location</Text>
                <DropDownPicker
                  open={locationOpen}
                  value={locationValue}
                  items={locationItems}
                  setOpen={setLocationOpen}
                  setValue={setLocationValue}
                  placeholder="Select Location"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownList}
                  zIndex={1000}
                  zIndexInverse={3000}
                />
              </View>
            </View>

            {showTripDatePicker && (
              <DateTimePicker
                value={tripDate}
                mode="date"
                display="default"
                onChange={handleTripDateChange}
              />
            )}

            {showTripFromTimePicker && (
              <DateTimePicker
                value={tripFromTime}
                mode="time"
                display="default"
                onChange={handleTripFromTimeChange}
              />
            )}

            {showTripToTimePicker && (
              <DateTimePicker
                value={tripToTime}
                mode="time"
                display="default"
                onChange={handleTripToTimeChange}
              />
            )}

            <TouchableOpacity style={styles.addButton} onPress={addTripDetail}>
              <Text style={styles.addButtonText}>Add Trip Detail</Text>
            </TouchableOpacity>

            {/* Trip Details Table */}
            {tripDetails.length > 0 && (
              <View style={styles.tableContainer}>
                <Text style={styles.tableTitle}>Trip Details</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderCell, styles.serialCell]}>
                        S.No
                      </Text>
                      <Text style={styles.tableHeaderCell}>Date</Text>
                      <Text style={styles.tableHeaderCell}>From Time</Text>
                      <Text style={styles.tableHeaderCell}>To Time</Text>
                      <Text style={styles.tableHeaderCell}>Mode</Text>
                      <Text style={styles.tableHeaderCell}>KM</Text>
                      <Text style={styles.tableHeaderCell}>Nighthalt</Text>
                      <Text style={styles.tableHeaderCell}>Location</Text>
                      <Text style={styles.tableHeaderCell}>Particulars</Text>
                    </View>
                    {tripDetails.map((detail, index) =>
                      renderTableRow(detail, index, true),
                    )}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Add Expenses Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Expenses</Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowExpenseDatePicker(true)}>
                  <Text style={{color: COLORS.TEXT_PRIMARY}}>
                    {formatDate(expenseDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Expense Name</Text>
                <DropDownPicker
                  open={expenseNameOpen}
                  value={expenseNameValue}
                  items={expenseNameItems}
                  setOpen={setExpenseNameOpen}
                  setValue={setExpenseNameValue}
                  placeholder="Select Expense"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownList}
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                  style={styles.input}
                  placeholder="From Location"
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  value={fromLocation}
                  onChangeText={setFromLocation}
                />
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  style={styles.input}
                  placeholder="To Location"
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  value={toLocation}
                  onChangeText={setToLocation}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Particulars"
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                  value={expenseParticulars}
                  onChangeText={setExpenseParticulars}
                />
              </View>
            </View>

            {/* Expense Date Picker */}
            {showExpenseDatePicker && (
              <DateTimePicker
                value={expenseDate}
                mode="date"
                display="default"
                onChange={handleExpenseDateChange}
              />
            )}

            <TouchableOpacity style={styles.addButton} onPress={addExpense}>
              <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>

            {/* Expenses Table */}
            {expenses.length > 0 && (
              <View style={styles.tableContainer}>
                <Text style={styles.tableTitle}>Expenses</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderCell, styles.serialCell]}>
                        S.No
                      </Text>
                      <Text style={styles.tableHeaderCell}>Date</Text>
                      <Text style={styles.tableHeaderCell}>Expense</Text>
                      <Text style={styles.tableHeaderCell}>Amount</Text>
                      <Text style={styles.tableHeaderCell}>From Location</Text>
                      <Text style={styles.tableHeaderCell}>To Location</Text>
                      <Text style={styles.tableHeaderCell}>Particulars</Text>
                    </View>
                    {expenses.map((expense, index) =>
                      renderTableRow(expense, index, false),
                    )}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={submitTourData}>
            <Text style={styles.saveButtonText}>
              {editMode ? 'Update Tour' : 'Save Tour Data'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  flex: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  input: {
    color: COLORS.BLACK,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    minHeight: 50,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  dropdown: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 50,
  },
  dropdownList: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.GRAY,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    color: COLORS.WHITE,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
  },
  tableHeaderCell: {
    padding: 12,
    color: COLORS.WHITE,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 100,
    borderRightWidth: 1,
    borderRightColor: COLORS.WHITE,
  },
  serialCell: {
    minWidth: 60,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  tableCell: {
    padding: 12,
    textAlign: 'center',
    color: COLORS.TEXT_PRIMARY,
    minWidth: 100,
    borderRightWidth: 1,
    borderRightColor: COLORS.GRAY,
  },
  saveButton: {
    backgroundColor: COLORS.SUCCESS,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
});

export default Tour;