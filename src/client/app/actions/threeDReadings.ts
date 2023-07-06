/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TimeInterval } from '../../../common/TimeInterval';
import { ActionType, Thunk, Dispatch, GetState } from '../types/redux/actions';
import { State } from '../types/redux/state';
import * as t from '../types/redux/threeDReadings';
import { ThreeDReadingPrecision } from '../types/redux/graph'
import { readingsApi } from '../utils/api';
import { ThreeDReading } from '../types/readings';

/**
 * @param meterID the IDs of the meters to get readings
 * @param timeInterval the interval over which to check
 * @param unitID the ID of the unit for which to check
 * @param readingCount number of readings occurring on the x axis (one day typically corresponds to a y axis tick)
 */
function requestMeterThreeDReadings(meterID: number, timeInterval: TimeInterval, unitID: number, readingCount: ThreeDReadingPrecision)
	: t.RequestMeterThreeDReadingsAction {
	return { type: ActionType.RequestMeterThreeDReadings, meterID, timeInterval, unitID, precision: readingCount };
}

/**
 * @param meterID the IDs of the meters to get readings
 * @param timeInterval the interval over which to check
 * @param unitID the ID of the unit for which to check
 * @param readingCount number of readings occurring on the x axis (one day typically corresponds to a y axis tick)
 * @param readings the readings for the given meters
 */
function receiveMeterThreeDReadings(
	meterID: number, timeInterval: TimeInterval, unitID: number, readingCount: ThreeDReadingPrecision, readings: ThreeDReading)
	: t.ReceiveMeterThreeDReadingsAction {
	return { type: ActionType.ReceiveMeterThreeDReadings, meterID, timeInterval, unitID, precision: readingCount, readings };
}

/**
 * @param meterID the IDs of the meters to get readings
 * @param timeInterval the interval over which to check
 * @param unitID the ID of the unit for which to check
 * @param precision number of readings occurring on the x axis (one day typically corresponds to a y axis tick)
 */
function fetchMeterThreeDReadings(meterID: number, timeInterval: TimeInterval, unitID: number, precision: ThreeDReadingPrecision): Thunk {
	return async (dispatch: Dispatch) => {
		dispatch(requestMeterThreeDReadings(meterID, timeInterval, unitID, precision));
		const meterThreeDReadings = await readingsApi.meterThreeDReadings(meterID, timeInterval, unitID);
		dispatch(receiveMeterThreeDReadings(meterID, timeInterval, unitID, precision, meterThreeDReadings));
	};
}

/**
 * Fetches 3D readings for the selected meter if needed.
 * @param meterID Meter for which to fetch data
 */
// export function fetchNeededThreeDReadings(timeInterval: TimeInterval, unitID: number): Thunk {
export function fetchNeededThreeDReadings(meterID: number): Thunk {
	return (dispatch: Dispatch, getState: GetState) => {
		const state = getState();
		if (shouldFetchMeterThreeDReadings(state, meterID, state.graph.timeInterval, state.graph.selectedUnit, ThreeDReadingPrecision.hourly)) {
			return dispatch(fetchMeterThreeDReadings(meterID, state.graph.timeInterval, state.graph.selectedUnit, state.graph.threeDAxisPrecision));
		}
		else {
			return Promise.resolve();
		}
	};
}

/**
 * @param state the Redux state
 * @param meterID the ID of the meter to check
 * @param timeInterval the interval over which to check
 * @param unitID the ID of the unit for which to check
 * @param precision number of readings occurring on the x axis (one day typically corresponds to a y axis tick)
 * @returns True if the readings for the given meter, time duration and unit are missing; false otherwise.
 */
// function shouldFetchMeterThreeDReadings(state: State, meterID: number, timeInterval: TimeInterval, unitID: number): boolean {
function shouldFetchMeterThreeDReadings(state: State, meterID: number, timeInterval: TimeInterval, unitID: number, precision: ThreeDReadingPrecision)
	: boolean {
	const timeIntervalIndex = timeInterval.toString();

	const readingsForID = state.readings.threeD.byMeterID[meterID];
	if (readingsForID === undefined) {
		return true;
	}

	const readingsForTimeInterval = readingsForID[timeIntervalIndex];
	if (readingsForTimeInterval === undefined) {
		return true;
	}

	const readingsForUnit = readingsForTimeInterval[unitID];
	if (readingsForUnit === undefined) {
		return true;
	}

	const readingsForReadingCount = readingsForUnit[precision];
	if (readingsForReadingCount === undefined) {
		return true;
	}
	return false;
}