import { db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const fetchMonthlyData = async () => {
  const q = query(collection(db, "updates"), orderBy("timestamp", "desc"));

  const querySnapshot = await getDocs(q);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return querySnapshot.docs
    .map((doc) => doc.data())
    .filter((data) => {
      if (!data.timestamp) return false;
      const docDate = data.timestamp.toDate();
      return docDate >= thirtyDaysAgo;
    });
};

export const fetchTodayData = async () => {
  const q = query(collection(db, "updates"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return querySnapshot.docs
    .map((doc) => doc.data())
    .filter((data) => {
      if (!data.timestamp) return false;
      return data.timestamp.toDate() >= startOfToday;
    });
};
