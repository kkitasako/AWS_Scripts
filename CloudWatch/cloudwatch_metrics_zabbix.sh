#!/bin/sh
#------------------------------------------------
#  AWS Scripts
#  Zabbix Script to get CloudWatch Metrics
#
#  Description:
#   call aws cloudwatch get-metrics-statistics
#-----------------------------------------------


#-----------------------------------------------
# ARGS & PARAMS
#   $1 NAMESPACE
#   $2 METRIC NAME
#   $3 STATISTICS
#-----------------------------------------------

NAMESPACE=$1
METRIC_NAME=$2
STATISTICS=$3

# Set START_TIME as 1min before
START_TIME=`date -u -v-2M "+%Y-%m-%dT%H:%M:00"`
END_TIME=`date -u "+%Y-%m-%dT%H:%M:3"`
PERIOD=60

#-----------------------------------------------
# Execute AWS CLI Command
# aws cloudwatch get-metrics-statistic
#  Get only statistics Value
#-----------------------------------------------

aws cloudwatch get-metric-statistics --namespace $NAMESPACE --metric-name $METRIC_NAME --start-time $START_TIME --end-time $END_TIME --period $PERIOD --statistics $STATISTICS | grep DATAPOINTS | awk '{print $2}' | head -n 1

