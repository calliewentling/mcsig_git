<?php

class QueryInstances {

   private $_db;
   protected $_result;
   public $results;

   public function __construct() {
       $this->_db = new pg_connect("host=localhost dbname=postgres user=postgres password=thesis2021");

       $_db = $this->_db;

       if ($_db->connect_error) {
           die('Connection Error: ' . $_db->connect_error);
       }

       return $_db;
   }

   public function getResults($params) {
       $_db = $this->_db;

       $_result =  pg_query($db, "SELECT story_id AS storyId, t_begin AS tBegin, t_end AS tEnd, t_desc AS tDesc, place_id AS placeId, sinstance_id AS instanceID FROM public.sinstance") or die('Connection Error: ' . $_db->connect_error);

       $results = array();

       while ($row = $_result->fetch_assoc()) {
           array_push($results, $row);
       }

       $this->_db->pg_close($_db);

       return $results;
   }

}
// https://docs.sencha.com/extjs/6.2.0/guides/backend_connectors/direct/mysql_php.html