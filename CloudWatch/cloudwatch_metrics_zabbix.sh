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
#   $2 DIMENSION NAME
#   $3 DIMENSION VALUE
#   $4 METRIC NAME
#   $5 STATISTICS
#-----------------------------------------------

NAMESPACE=$1
DIMENSION_NAME=$2
DIMENSION_VALUE=$3
METRIC_NAME=$4
STATISTICS=$5

# Set START_TIME as 1min before
START_TIME=`date -u --date "2 minute ago" +"%FT%H:%M:00"`
END_TIME=`date -u +"%FT%H:%M:00"`
PERIOD=60

# Set Region
REGION="ap-northeast-1"

#-----------------------------------------------
# Execute AWS CLI Command
# aws cloudwatch get-metrics-statistic
#  Get only statistics Value
#-----------------------------------------------

aws cloudwatch get-metric-statistics --region $REGION --namespace $NAMESPACE --dimensions Name=$DIMENSION_NAME,Value=$DIMENSION_VALUE --metric-name $METRIC_NAME --start-time $START_TIME --end-time $END_TIME --period $PERIOD --statistics $STATISTICS | grep $STATISTICS | awk '{print $2}' | head -n 1 | sed -e "s/,//g"
